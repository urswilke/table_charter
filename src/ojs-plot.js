import { LitElement, css, html } from "lit";
import { translate, get } from "lit-translate";
import { bg_col, fg_col, fantasy_string } from "./utils.js";

import { PlotOptions } from "./gen_plot_types.js";
import * as Plot from "@observablehq/plot";
import { select } from "d3";

const inspect = false; // set to true for some console.log msgs

export class OJSPlot extends LitElement {
    static properties = {
        plot_data: { type: Array },
        id: { type: String },
        chartTitle: { type: String },
        plot_options: { type: PlotOptions },
        file_name: { type: String },
        language: { type: String },
    };

    connectedCallback() {
        super.connectedCallback();
        this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
        this.resizeObserver.observe(this, { box: "border-box" });
        this.set_dimensions();
    }
    onResize(entries) {
        window.requestAnimationFrame(() => {
            if (!Array.isArray(entries) || !entries.length) return;
            this.set_dimensions();
        });
    }
    set_dimensions() {
        this.width = this.offsetWidth;
        this.height = this.offsetHeight;
        this.plot_data && (this.plot_data = { ...this.plot_data });
    }

    get plot_data() {
        return this._plot_data;
    }
    set plot_data(val) {
        // TODO: when resizing, this method gets called twice => try to refactor code to only call it once...
        if (!val || val.length === 0) {
            return this;
        }
        val.params = {
            element_height: this.height,
            element_width: this.width,
            // TODO: language (decimal separator in plot) isn't updated until the next plot is generated...:
            language: this.language,
        };
        this._plot_data = val;
        this.plot_options = new PlotOptions(val);
        const font_size = this.plot_options.input.font_size;
        this.style.setProperty("--font-size", String(font_size) + "px");
        this.style.setProperty(
            "--big-font-size",
            String(1.2 * font_size) + "px",
        );

        this.chartTitle = this.plot_options.input.TabTitle;
        const chartHeaders =
            !!val.plot_data && val.plot_data.length > 0
                ? get("plotTitle.subtitle_beginning") +
                  " " +
                  [...new Set(val.plot_data.map((x) => x.ColTitle1))].join(
                      " / ",
                  )
                : null;
        const chartCaption =
            !!val.plot_data && val.plot_data.length > 0
                ? val.plot_data[0].TabCaption
                : null;
        this.chartSubTitle = [
            this.plot_options.input.show_subtitles && chartHeaders,
            chartCaption,
        ]
            // remove empty:
            .filter((n) => n)
            .join(" - ");

        const options = this.plot_options?.options;
        if (!options) {
            return;
        }
        // this.renderedPlot = Object.assign(Plot.plot(options), {
        //     style: `max-width: ${options.width}px;`,
        // });
        this.renderedPlot = Plot.plot(options);
        // delete this.renderedPlot.style.maxWidth;

        let len,
            margin1,
            margin2,
            margin1_string,
            margin2_string,
            grid_template_string,
            padding1_string,
            padding2_string,
            grid_end,
            len_string,
            flex_dir,
            cross_dir,
            write_labels,
            content_justifier,
            word_breaker,
            hyphenator,
            text_overflower,
            white_spacer,
            overflower;

        const x_order = this.plot_options.derived.x_order;
        const n_cats = x_order.length;
        const is_x = this.plot_options.derived.is_x;
        const show_coltitle1 = this.plot_options.input.show_coltitle1;
        const show_n = this.plot_options.input.n_axis;

        if (is_x) {
            len = options.width;
            len_string = "width";
            margin1 = options.marginLeft;
            margin2 = options.marginRight;
            margin1_string = "margin-left";
            margin2_string = "margin-right";
            grid_template_string = "grid-template-columns";
            padding1_string = "padding-left";
            padding2_string = "padding-right";
            grid_end = "grid-column-end";
            flex_dir = "column";
            cross_dir = "row";
            write_labels = () => {
                write_col_title2();

                show_n && write_col_totals();

                show_coltitle1 && write_col_title1();
            };
        } else {
            len = options.height;
            len_string = "height";
            margin1 = options.marginBottom;
            margin2 = options.marginTop;
            margin1_string = "margin-bottom";
            margin2_string = "margin-top";
            grid_template_string = "grid-template-rows";
            padding1_string = "padding-bottom";
            padding2_string = "padding-top";
            grid_end = "grid-row-end";
            flex_dir = "row";
            cross_dir = "column";
            write_labels = () => {
                show_coltitle1 && write_col_title1();
                show_n && write_col_totals();
                write_col_title2();
            };
        }
        this.style.setProperty("--flex-dir", flex_dir);

        switch (this.plot_options.input.axis_labels) {
            case "truncate":
                text_overflower = "ellipsis";
                white_spacer = "nowrap";
                overflower = "hidden";
                word_breaker = "break-word";
                hyphenator = "auto";
                break;
            case "whole":
                text_overflower = "not_needed";
                white_spacer = "normal";
                overflower = "visible";
                break;
            default:
                break;
        }
        word_breaker =
            is_x & (this.plot_options.input.axis_labels === "")
                ? "break-word"
                : "normal";
        content_justifier = is_x ? "center" : "start";

        hyphenator = is_x ? "auto" : "none";
        this.style.setProperty("--justify-content-attr", content_justifier);
        this.style.setProperty("--text-overflow-attr", text_overflower);
        this.style.setProperty("--white-space-attr", white_spacer);
        this.style.setProperty("--overflow-attr", overflower);
        this.style.setProperty("--break-words-attr", word_breaker);
        this.style.setProperty("--hyphens-attr", hyphenator);

        const inset = (len - margin1 - margin2) / (10 * n_cats + 1);

        val.choices.show_box === "box" && this.add_box_around_text();

        var cat_labels_div = select(this.renderedPlot)
            .append("div")
            .classed("cat_labels_div", true);

        const header_table_gaps = this.plot_options.derived.header_table_gaps;
        const arr_col_title1 = Object.entries(
            Object.groupBy(header_table_gaps, (x) => x.ColTitle1),
        );

        const cat_labels = cat_labels_div.selectAll("div");
        write_labels();

        const padding =
            this.plot_options.input.plot_type === "bar" ? inset : inset / 2;
        const plot_width = len - margin1 - margin2 - 2 * padding + "px";
        const style = {
            [margin1_string]: margin1 + "px",
            [margin2_string]: margin2 + "px",
            display: "grid",
            [grid_template_string]: `repeat(${n_cats}, minmax(0, 1fr))`,
            [len_string]: plot_width,
            [flex_dir + "-gap"]: inset + "px",
            [cross_dir + "-gap"]: "5px",
            [padding1_string]: padding + "px",
            [padding2_string]: padding + "px",
            "font-size": font_size + "px",
            ...(!is_x && {
                "padding-left": "5%",
                "grid-auto-flow": "column",
                "max-width":
                    this.plot_options.derived.x_chart_labels_width * 100 -
                    5 +
                    "%",
            }),
        };

        Object.entries(style).forEach(([prop, val]) =>
            cat_labels_div.style(prop, val),
        );

        if (!is_x) {
            select(this.renderedPlot).select('svg[class*="plot-"]').raise();
        }

        // https://talk.observablehq.com/t/legend-placement-options/8407/3
        this.legend = select(this.renderedPlot)
            .select(".large-font-ramp, .large-font-swatches")
            .remove();

        function write_col_title1() {
            cat_labels
                .data(arr_col_title1)
                .enter()
                .append("div")
                .classed("cat-label gap", (d) =>
                    d[0].startsWith(fantasy_string),
                )
                .attr("title", (d) => d[0])
                .classed("cat-label", true)
                .style(grid_end, (d) => "span " + d[1].length)
                .append("span")
                .text(function (d) {
                    return d[0].replace(
                        RegExp("^" + fantasy_string + "a*$"),
                        "",
                    );
                });
        }
        function write_col_title2() {
            cat_labels
                .data(x_order)
                .enter()
                .append("div")
                .classed("cat-label gap", (d) => d.includes(fantasy_string))
                .classed("cat-label", true)
                .attr("title", (d) => d)
                .append("span")
                .text(function (d) {
                    return d.replace(RegExp("^" + fantasy_string + ".*"), "");
                });
        }
        function write_col_totals() {
            cat_labels
                .data(header_table_gaps)
                .enter()
                .append("div")
                .classed("cat-label gap", (d) =>
                    d.ColTitle1.includes(fantasy_string),
                )
                .classed("cat-label n-div", true)
                .attr("title", (d) => "n = " + d.Value)
                .style("color", "grey")
                .style("border", "none")
                .append("span")
                .text(function (d) {
                    return d.Value;
                });
        }
    }
    // this could be an alternative way to get the positions of the plot area
    // updated() {
    //     console.log(this.renderRoot.querySelector('rect[aria-label="frame"]')?.getBBox());
    // }

    add_box_around_text() {
        // https://stackoverflow.com/questions/35075693/d3-add-filter-as-background-to-svg-element/35076784#35076784
        var svg = select(this.renderedPlot).select("svg");
        var filterDef = svg.append("defs");
        var filter = filterDef
            .append("filter")
            .attr("id", "textBackground")
            .attr("x", "-20%")
            .attr("y", "-10%")
            .attr("width", "140%")
            .attr("height", "120%");
        filter
            .append("feFlood")
            .attr("flood-color", bg_col)
            .attr("result", "txtBackground");
        var filterMerge = filter.append("feMerge");
        filterMerge.append("feMergeNode").attr("in", "txtBackground");
        filterMerge.append("feMergeNode").attr("in", "SourceGraphic");
        select(this.renderedPlot)
            .selectAll("g[aria-label='text'] > text")
            .style("filter", "url(#textBackground)");
    }

    render() {
        inspect && console.log("render");

        // prettier-ignore
        return this.plot_options?.options === undefined
            ? html`
                <div class="all-filtered">
                    <h1>${translate("noData.title")}</h1>
                    <h3>${translate("noData.subTitle")}</h3>
                </div>
            `
            // it's important to put the chart title text directly next to the ">" because of the pre-wrap style:
            : html`
                <div>
                    <div id="ojs-plot-div">
                        <div class="headers">
                            <h2
                                class="primary multi-line-header"
                                data-test-id="plot-header"
                            >${this.chartTitle}</h2>
                            <h4>${this.chartSubTitle}</h4>
                        </div>
                        <div class="plot-div">${this.renderedPlot}</div>
                        <div class="legend-container">
                            ${this.legend}
                        </div>
                    </div>
                </div>
            `;
    }
    static styles = [
        css`
            .headers {
                margin: 40px;
                margin-bottom: 0;
            }
            .multi-line-header {
                white-space: pre-wrap;
            }
            .large-font-swatches,
            .large-font-ramp {
                font-size: var(--font-size);
                justify-content: center;
            }
            .plot-div {
                text-align: center;
            }
            #no-data {
                border: 0.05em solid red;
                padding: 10px;
            }
            h2 {
                font-size: var(--big-font-size);
            }
            h4 {
                font-size: var(--font-size);
                margin-left: 20px;
            }
            .all-filtered {
                border: solid red;
                padding: 15px;
                border-width: 2px;
                border-radius: 8px;
            }
            figure[class*="plot-"] {
                margin: 0px;
                display: flex;
                flex-direction: var(--flex-dir);
            }
            .cat-label {
                display: flex;
                align-items: center;
                justify-content: var(--justify-content-attr);
                padding: 2px;
                overflow: var(--overflow-attr);
            }
            .cat-label:not(.n-div) {
                -webkit-box-shadow: inset 0px 0px 0px 1px;
                -moz-box-shadow: inset 0px 0px 0px 1px;
                box-shadow: inset 0px 0px 0px 1px;
            }
            .cat-label span {
                overflow: var(--overflow-attr);
                text-overflow: var(--text-overflow-attr);
                white-space: var(--white-space-attr);
                word-break: var(--break-words-attr);
                hyphens: var(--hyphens-attr);
            }
            .cat-label:hover:not(.n-div),
            .cat-label:hover:not(.n-div) span {
                white-space: normal;
                overflow: visible;
                background-color: grey;
                z-index: 2;
            }
            .gap {
                visibility: hidden;
            }
            .legend-container {
                margin: 20px;
                display: flex;
                justify-content: center;
            }
            /* #ojs-plot-div {
                margin-right: 10%;
                margin-left: 10%;
            } */

            /* this would add an orange border on hover: */
            /* svg[class^=plot-] > g > circle:hover,
            svg[class^=plot-] > g > rect:hover {
                stroke: orange;
                stroke-width:  2px;
            } */
        `,
    ];
}

window.customElements.define("ojs-plot", OJSPlot);
