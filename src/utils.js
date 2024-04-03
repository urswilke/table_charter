import { chain, pick, uniqWith, isEqual } from "lodash";
import { decompress } from "compress-json";

export function distinct(arr, X) {
    return chain(arr.map((o) => pick(o, X)))
        .uniqWith(isEqual)
        .value();
}

const is_dark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
export const bg_col = is_dark ? `#000000` : `#ffffff`;
export const fg_col = !is_dark ? `#000000` : `#ffffff`;

export function gen_header_table(data) {
    const arr = distinct(
        data,
        // TODO: HeadNo is 2 for first 2 Heads => correct in crosstabser!
        ["ColNo", "HeadNo", "ColTitle1", "ColTitle2"],
    );
    const first_two_titles = [...new Set(arr.map((x) => x.ColTitle1))].slice(
        0,
        2,
    );
    return arr.map((p) =>
        first_two_titles.includes(p.ColTitle1)
            ? { ...p, selected: true }
            : { ...p, selected: false },
    );
}

export function gen_row_table(data) {
    const arr = distinct(data, ["RowContent", "RowTitle1", "RowTitle2"]);
    const row_contents = [...new Set(arr.map((x) => x.RowContent))];
    var types_to_take;
    if (row_contents.includes("Detail")) {
        types_to_take = ["Detail"];
    } else if (row_contents.includes("Summary")) {
        types_to_take = ["Summary"];
    } else {
        // setdiff:
        types_to_take = row_contents.filter(
            (x) => !["Valid", "Total"].includes(x),
        );
    }
    return arr.map((p) =>
        types_to_take.includes(p.RowContent)
            ? { ...p, selected: true }
            : { ...p, selected: false },
    );
}

export function filter_sel_headers(data, header_table) {
    const arr_sel = header_table.filter((x) => x.selected);
    const col_fun2 = (x) => (x.ColTitle2 != " " ? x.ColTitle2 : x.ColTitle1);
    const col_fun1 = (x) => x.ColTitle1;
    const res = data.filter(
        (x) =>
            [...new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)) &
            [...new Set(arr_sel.map(col_fun1))].includes(col_fun1(x)),
    );
    return res;
}
export function filter_sel_rows(data, header_table) {
    const arr_sel = header_table.filter((x) => x.selected);
    const col_fun1 = (x) => x.RowTitle1;
    const col_fun2 = (x) => x.RowTitle2;
    const res = data.filter(
        (x) =>
            [...new Set(arr_sel.map(col_fun1))].includes(col_fun1(x)) &
            [...new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)),
    );
    return res;
}

export function gen_plot_type_string(tab_sel_obj) {
    let tab_type = tab_sel_obj.question_data[0].TabType;
    if (
        tab_type === "CAT" ||
        // mw question that has a column TabDetails with the value "100percent" in the 1st row and percent values are selected:
        (tab_type === "MW") &
            (tab_sel_obj.question_data[0].TabDetails === "100percent") &
            (tab_sel_obj.choices.row_type === "%")
    ) {
        return "bar";
    }
    if (tab_type === "MCG") {
        return "bar";
    }
    if (tab_type === "MDG") {
        return "bar";
    }
    if (tab_type === "MW") {
        return "line";
    } else {
        alert("Table type " + tab_type + " not implemented.");
    }
}

export function prepare_data(data_obj) {
    let data = data_obj.data;
    switch (data_obj.type) {
        case "compressed":
            data = decompress(data);
            break;
        case "uncompressed":
            data = data_obj.data;
    }

    const unique_combis = distinct(data, ["QuestNo", "TabNo"]).map(
        (x) => x.QuestNo + "-" + x.TabNo,
    );

    return data.map((x) => ({
        ...x,
        // TODO: remove? (because it will be already done in future json data...)
        TabType: x.TabType.toUpperCase(),
        i_tab: unique_combis.indexOf(x.QuestNo + "-" + x.TabNo),
    }));
}

export function save_file() {
    document.querySelector("table-charter").dataset.savedSettings =
        JSON.stringify(this.saved);
    var text = document.querySelector("html").innerHTML;
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    const whole_file_name = location.href;
    var file_name = whole_file_name
        .replace(/\/$/, "")
        .replace(/\.html$/, "")
        .split("/");
    file_name = file_name[file_name.length - 1];
    var time_string = new Date().toJSON().slice(0, 19);
    var ind2 = file_name.lastIndexOf(".");

    var new_url = file_name.substring(ind2) + "_" + time_string + ".html";
    element.setAttribute("download", new_url);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// add varying number of spaces to duplicated `ColTitle2`s
// (that every ColNo has a unique ColTitle2):
export function add_spaces(data) {
    var coltitle_array = distinct(data, ["ColNo", "ColTitle2"]);
    var counts = {};
    for (let i = 0; i < coltitle_array.length; i++) {
        const e = coltitle_array[i];
        counts = {
            ...counts,
            [e.ColTitle2]: (counts[e.ColTitle2] || 0) + 1,
        };
        e.n = counts[e.ColTitle2];
    }
    // TODO fix: undefined becomes string "undefined" here:
    var coltitle_array_unique = coltitle_array.map((x) => ({
        ColNo: x.ColNo,
        ColTitle2: (x.ColTitle2 + " ".repeat(x.n - 1)).replace(
            /^undefined */,
            "-",
        ),
    }));

    return data.map((s) => ({
        ...s,
        ...coltitle_array_unique.find((t) => t.ColNo === s.ColNo),
    }));
}

export const fantasy_string = "this_label_should_never_occur_in_real_data";

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

export function calc_header_text_lengths(po) {
    const header_table = po.input.header_table;
    const font_size = po.input.font_size;
    const is_x = po.derived.is_x;
    const plot_width = po.params.element_width;
    const max_len = plot_width / 5;
    const n_bars = po.derived.x_order.length;
    const text_width = is_x
        ? Math.floor((plot_width / n_bars / font_size) * 0.8)
        : 7;
    let subheader_linewidth_px = get_max_text_len(
        header_table.map((x) => x.ColTitle2),
        font_size,
    );
    let header_part_linewidth_px = get_max_text_len(
        header_table.map((x) => x.ColTitle1),
        font_size,
    );
    subheader_linewidth_px = Math.min(subheader_linewidth_px, max_len);
    header_part_linewidth_px = Math.min(header_part_linewidth_px, max_len);
    const header_linewidth_px =
        header_part_linewidth_px + subheader_linewidth_px + 40;

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
export function get_max_stack_value(array) {
    var result = [];
    const stack_array = array.reduce(function (res, value) {
        if (!res[value.ColNo]) {
            res[value.ColNo] = { ColNo: value.ColNo, Value: 0 };
            result.push(res[value.ColNo]);
        }
        res[value.ColNo].Value += value.Value;
        return res;
    }, {});
    return Math.max(...result.map((o) => o.Value));
}
