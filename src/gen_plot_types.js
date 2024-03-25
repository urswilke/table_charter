import * as Plot from "@observablehq/plot";
import { bg_col, fg_col } from "./utils.js";
import { distinct, fantasy_string } from "./utils.js";
import { get } from "lit-translate";

export class PlotOptions {
    constructor(input_data) {
        this.input = input_data.choices;
        this.params = input_data.params;
        this.plot_data = input_data.plot_data;
        if (this.plot_data.length === 0) {
            return null;
        }
        this.pre_process();
        // Execute method bar() or line() depending on the plot type:
        this[this.input.plot_type]();
        this.post_process();
    }
    pre_process() {
        const input = this.input;
        const { xy, color_scale, separate_headers, color_scheme } = input;
        let x2,
            x1,
            is_x,
            col_lab_fun,
            row_lab_fun,
            color_order,
            x_order,
            plot_opts,
            color_opts,
            x1_opts,
            x2_opts,
            n_decimals,
            marginLeft,
            marginBottom,
            axis_,
            group_;

        x2 = xy;
        x1 = x2 === "x" ? "y" : "x";
        is_x = xy === "x";

        col_lab_fun = (x) => x.ColTitle2;
        row_lab_fun =
            color_scale === "categorical"
                ? (x) => x.RowTitle2
                : (x) => x.RowValue;
        color_order = [
            ...new Set(
                this.plot_data
                    .sort((a, b) => a.RowNo - b.RowNo)
                    .map(row_lab_fun),
            ),
        ];
        x_order = [
            ...new Set(
                this.plot_data
                    .sort((a, b) => a.ColNo - b.ColNo)
                    .map(col_lab_fun),
            ),
        ];
        if (separate_headers) {
            x_order = add_gaps_to_xlabels(
                x_order,
                distinct(this.plot_data, ["ColTitle1", "ColNo"]).map(
                    (x) => x.ColTitle1,
                ),
            );
        }

        plot_opts = {
            [x2]: col_lab_fun,
            [x1]: "Value",
        };

        color_opts = {
            type: color_scale === "ordinal" ? "linear" : color_scale,
            scheme: color_schemes_maps[color_scale].get(color_scheme),
            domain: color_order,
            legend: true,
        };

        x1_opts = {
            label: null,
        };
        x2_opts = {
            domain: x_order,
            label: null,
        };
        n_decimals = this.plot_data[0].RowDecimals;
        marginBottom = 80;
        axis_ = x1 === "y" ? "axisX" : "axisY";
        group_ = x1 === "y" ? "groupX" : "groupY";
        this.derived = {
            x2,
            x1,
            is_x,
            col_lab_fun,
            row_lab_fun,
            color_order,
            x_order,
            plot_opts,
            color_opts,
            x1_opts,
            x2_opts,
            n_decimals,
            marginLeft,
            marginBottom,
            axis_,
            group_,
        };
        // comes here, because depends on this.derived...:
        this.header_text_lengths = calc_header_text_lengths(this);
        this.derived.marginLeft =
            x1 === "y" ? 60 : this.header_text_lengths.header_linewidth_px + 40;
    }
    bar() {
        const derived = this.derived;

        const { x1, is_x, plot_opts, row_lab_fun, color_order, n_decimals } =
            derived;
        let text_,
            stack_,
            bar_,
            group_args1,
            group_args2_bar,
            group_args2_text,
            group_args2_text_n;
        text_ = x1 === "y" ? "textY" : "textX";
        stack_ = x1 === "y" ? "stackY" : "stackX";
        bar_ = x1 === "y" ? "barY" : "barX";

        group_args1 = { text: "first", [x1]: "sum" };
        group_args2_bar = {
            ...plot_opts,
            fill: row_lab_fun,
            z: (x) => x.RowNo,
            order: color_order,
            title: tooltip_fun(n_decimals),
        };
        group_args2_text = {
            ...plot_opts,
            text: (x) =>
                x.Value === undefined || x.Value == 0
                    ? null
                    : x.Value.toFixed(n_decimals),
            z: (x) => x.RowNo,
            order: color_order,
            title: tooltip_fun(n_decimals),
            // put halo around text:
            // https://observablehq.com/plot/marks/text#text-options
            stroke: bg_col,
            strokeWidth: 3,
            fill: fg_col,
        };
        group_args2_text_n = {
            ...plot_opts,
            text: (x) =>
                x.ColMean === undefined ? null : "Ø: " + x.ColMean.toFixed(1),
            order: color_order,
        };
        group_args2_text_n[is_x ? "dy" : "dx"] = is_x ? -15 : 10;
        is_x
            ? (group_args2_text_n.lineAnchor = "bottom")
            : (group_args2_text_n.textAnchor = "start");
        this.derived_p = {
            text_,
            stack_,
            bar_,
            group_args1,
            group_args2_bar,
            group_args2_text,
            group_args2_text_n,
            is_x,
        };
        this.bar_plot_options();
    }
    bar_plot_options() {
        const { derived_p, derived, input, plot_data } = this;
        const {
            group_args1,
            group_args2_bar,
            group_args2_text,
            group_args2_text_n,
            is_x,
            bar_,
            stack_,
            text_,
        } = derived_p;
        const { color_scale, show_mean } = input;
        const { group_, color_opts } = derived;
        // reverse stack order for barY charts (in order to have the same order as the legend and the tables)
        // https://stackoverflow.com/questions/68056843/in-observable-plot-how-to-sort-order-the-stack-from-a-bin-transform/68057660#68057660
        const bar_opts = {
            ...Plot[group_](group_args1, group_args2_bar),
            ...(is_x && { reverse: true }),
        };
        const text_opts = {
            ...Plot[group_](group_args1, group_args2_text),
            ...(is_x && { reverse: true }),
        };

        this.options = {
            color: color_opts,
            marks: [
                Plot[bar_](plot_data, Plot[stack_](bar_opts)),
                // (explicit form of this):
                // Plot[bar_](plot_data, bar_opts),
                // https://talk.observablehq.com/t/how-to-display-text-in-each-level-of-a-stacked-bar-chart-made-with-plot/6510/2
                color_scale === "ordinal"
                    ? null
                    : Plot[text_](plot_data, Plot[stack_](text_opts)),
                // only show if there 10 different color values at max...:
                // color_order.length > 10? null : text_(data.plot_data, stack_(text_opts)),
                show_mean
                    ? Plot.text(
                          plot_data,
                          Plot[group_](group_args1, group_args2_text_n),
                      )
                    : null,
            ],
        };
    }

    line() {
        const derived = this.derived;
        const { plot_opts, is_x, row_lab_fun, n_decimals, x1, x2 } = derived;
        let line_opts, dot_opts, group_args1, group_args2_text_n;
        line_opts = {
            ...plot_opts,
            z: (x) => x.RowNo,
            stroke: row_lab_fun,
        };

        dot_opts = {
            ...line_opts,
            fill: row_lab_fun,
            stroke: "transparent",
            r: 7,
            title: tooltip_fun(n_decimals),
        };
        group_args1 = { [x1]: "max" };

        group_args2_text_n = {
            ...plot_opts,
            [x2]: "ColTitle2",
            z: "ColTitle2",
            text: (x) =>
                x.ColMean === undefined ? null : "Ø: " + x.ColMean.toFixed(1),
        };
        group_args2_text_n[is_x ? "dy" : "dx"] = is_x ? -15 : 15;
        is_x
            ? (group_args2_text_n.lineAnchor = "bottom")
            : (group_args2_text_n.textAnchor = "start");

        this.derived_p = {
            line_opts,
            dot_opts,
            group_args1,
            group_args2_text_n,
            is_x,
        };
        this.line_plot_options();
    }
    line_plot_options() {
        const { line_opts, dot_opts, group_args1, group_args2_text_n } =
            this.derived_p;
        const { color_opts } = this.derived;
        this.options = {
            color: color_opts,
            marks: [
                Plot.lineY(this.plot_data, line_opts),
                Plot.dot(this.plot_data, dot_opts),
                this.input.show_mean
                    ? Plot.text(
                          this.plot_data,
                          Plot.select(group_args1, group_args2_text_n),
                      )
                    : null,
            ],
        };
    }
    post_process() {
        const derived = this.derived;
        this.options.marginTop = 40;
        this.options.marginRight = 100;
        this.options.marginLeft = derived.marginLeft;
        this.options.marginBottom = derived.marginBottom;
        this.options[derived.x2] = derived.x2_opts;
        this.options[derived.x1] = derived.x1_opts;
        this.options.width = this.params.element_width;
        this.options.height = 0.7 * this.params.element_height;
        this.options.style = { fontSize: this.input.font_size + "px" };
        this.options.color.className = "large-font";
        set_axis_labels(this);
    }
}

function tooltip_fun(n_decimals) {
    return (x) =>
        [
            // The tooltip texts don't get updated, when the language setting is changed
            // but will be updated upon plot settings change. (translate() doesn't work here...):
            `${get("tooltips.row")}: ${x.RowTitle1}`,
            // only write row2 if differing from row1:
            x.RowTitle1 === x.RowTitle2
                ? null
                : `${get("tooltips.row2")}: ${x.RowTitle2}`,
            x.RowValue && `${get("tooltips.rowValue")}: ${x.RowValue}`,
            `${get("tooltips.header")}: ${x.ColTitle1}`,
            // TODO: see TODO in add_spaces() helper function!...:
            x.ColTitle2 === "undefined"
                ? null
                : `${get("tooltips.column")}: ${x.ColTitle2}`,
            // if an MW value is not defined,
            // it would lead to an error, for a line plot without this check:
            x.Value === undefined
                ? null
                : `${get("tooltips.value")}: ${x.Value.toFixed(n_decimals)}`,
            null,
        ].join("\n");
}

// from here:
// https://observablehq.com/@observablehq/plot-scales#schemeo
// and
// https://observablehq.com/@observablehq/plot-scales#schemec

const color_scheme_ordinal = new Map([
    ["Blues", "blues"],
    ["Greens", "greens"],
    ["Greys", "greys"],
    ["Purples", "purples"],
    ["Reds", "reds"],
    ["Oranges", "oranges"],
    ["Turbo", "turbo"],
    ["Viridis", "viridis"],
    ["Magma", "magma"],
    ["Inferno", "inferno"],
    ["Plasma", "plasma"],
    ["Cividis", "cividis"],
    ["Cubehelix", "cubehelix"],
    ["Warm", "warm"],
    ["Cool", "cool"],
    ["BuGn", "bugn"],
    ["BuPu", "bupu"],
    ["GnBu", "gnbu"],
    ["OrRd", "orrd"],
    ["PuBuGn", "pubugn"],
    ["PuBu", "pubu"],
    ["PuRd", "purd"],
    ["RdPu", "rdpu"],
    ["YlGnBu", "ylgnbu"],
    ["YlGn", "ylgn"],
    ["YlOrBr", "ylorbr"],
    ["YlOrRd", "ylorrd"],
    ["BrBG", "brbg"],
    ["PRGn", "prgn"],
    ["PiYG", "piyg"],
    ["PuOr", "puor"],
    ["RdBu", "rdbu"],
    ["RdGy", "rdgy"],
    ["RdYlBu", "rdylbu"],
    ["RdYlGn", "rdylgn"],
    ["Spectral", "spectral"],
    ["BuRd", "burd"],
    ["BuYlRd", "buylrd"],
    // doesn't make sense here:
    // ["Rainbow (cyclical)", "rainbow"],
    // ["Sinebow (cyclical)", "sinebow"]
]);

const color_scheme_discrete = new Map([
    ["Accent", "accent"],
    ["Category10", "category10"],
    ["Dark2", "dark2"],
    ["Paired", "paired"],
    ["Pastel1", "pastel1"],
    ["Pastel2", "pastel2"],
    ["Set1", "set1"],
    ["Set2", "set2"],
    ["Set3", "set3"],
    ["Tableau10", "tableau10"],
]);

const color_schemes_maps = {
    ordinal: color_scheme_ordinal,
    categorical: color_scheme_discrete,
};

export const all_color_schemes = {
    ordinal: [...color_schemes_maps.ordinal.keys()],
    categorical: [...color_schemes_maps.categorical.keys()],
};

function add_gaps_to_xlabels(x_order, col_titles) {
    // https://stackoverflow.com/questions/64204535/how-to-find-indexes-where-value-changes/64204722#64204722
    const diff_indices = [];
    col_titles.map((el, index) => {
        return (
            col_titles[index - 1] !== el &&
            index > 0 &&
            diff_indices.push(index)
        );
    });
    const x_order_gaps = [...x_order];

    // it seems as if the placeholders for the gaps need to be unique.
    // Therefore, we'll add an "a" for every new gap:
    var gap_string = fantasy_string;
    for (let i = diff_indices.length - 1; i >= 0; i--) {
        const diff_index = diff_indices[i];
        x_order_gaps.splice(diff_index, 0, gap_string);
        gap_string += "a";
    }
    return x_order_gaps;
}

function set_axis_labels(plot_options) {
    const xy = plot_options.derived.x2;
    const is_x = xy === "x";
    const plot_width = plot_options.options.width;
    const n_bars = plot_options.options[xy].domain.length;
    const font_size = Number(
        plot_options.options.style.fontSize.replace(/px/, ""),
    );
    const text_width = is_x
        ? Math.floor((plot_width / n_bars / font_size) * 0.8)
        : 7;
    // small margin (in pixel) from where the text starts (counting from the left of the bars on the x-axis):
    const text_margin_left = 5;

    const hl = plot_options.header_text_lengths;
    const header_tick_opts = {
        textAnchor: "start",
        // TODO: replace with HeadNo to prevent tohuwabohu if there are the same `ColTitle1`s for different headers (HeadNo is deleted from the input data at the moment...):
        z: "ColTitle1",
        text: "ColTitle1",
        tickSize: 0,
        tickFormat: (x) => x.ColTitle2,
        dx: is_x
            ? (-text_width / 2) * font_size + text_margin_left
            : -1 * hl.header_linewidth_px,
        dy: is_x ? 30 : 0,
        label: null,
        lineWidth: hl.header_line_width,
        textOverflow: "ellipsis-end",
        fontWeight: "bold",
    };
    header_tick_opts[xy] = "ColTitle2";
    const subheader_tick_opts = {
        textAnchor: "start",
        text: "ColTitle2",
        z: "ColNo",
        tickFormat: (x) => x.ColTitle2,
        tickSize: 0,
        label: null,
        dx: is_x
            ? (-text_width / 2) * font_size + text_margin_left
            : -1 * hl.subheader_linewidth_px,
        lineWidth: hl.subheader_line_width,
        textOverflow: "ellipsis-end",
    };
    subheader_tick_opts[xy] = "ColTitle2";
    plot_options.options.marks.push(
        Plot[plot_options.derived.axis_](
            plot_options.plot_data,
            Plot.selectFirst(header_tick_opts),
        ),
    );
    plot_options.options.marks.push(
        Plot[plot_options.derived.axis_](
            plot_options.plot_data,
            Plot.selectFirst(subheader_tick_opts),
        ),
    );
}

function get_max_text_len(string_array, font_size) {
    return (
        Math.max(
            ...string_array
                .filter((x) => !x.match("^" + fantasy_string))
                .map((el) => el.length),
        ) *
        font_size *
        0.7
    );
}

function calc_header_text_lengths(po) {
    const header_table = po.input.header_table;
    const font_size = po.input.font_size;
    const is_x = po.derived.is_x;
    const plot_width = po.params.element_width;
    const n_bars = po.derived.x_order.length;
    const text_width = is_x
        ? Math.floor((plot_width / n_bars / font_size) * 0.8)
        : 7;
    const subheader_linewidth_px = get_max_text_len(
        header_table.map((x) => x.ColTitle2),
        font_size,
    );
    const header_linewidth_px =
        get_max_text_len(
            header_table.map((x) => x.ColTitle1),
            font_size,
        ) +
        subheader_linewidth_px +
        40;

    const header_line_width = is_x
        ? text_width
        : (header_linewidth_px * 0.9) / font_size;
    const subheader_line_width = is_x
        ? text_width
        : (subheader_linewidth_px * 0.9) / font_size;
    return {
        subheader_linewidth_px,
        header_linewidth_px,
        header_line_width,
        subheader_line_width,
    };
}
