import { chain, pick, uniqWith, isEqual } from "lodash";

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
    let tab_type = tab_sel_obj.question_raw_data[0].TabType;
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
    data_obj.Tab = data_obj.Tab.map((x, i) => ({
        // ascending index 0, 1, 2, ... for every question in the data (pair of QuestNo & TabNo)
        i_tab: i,
        ...x,
        // when plots are added via duplicating rows in questions-table,
        // this will re-build this index, which will generate a new
        // ascending index 0, 1, 2, ... every time a row gets duplicated:
        i_tab_dyn: i,
        // this is used for indexing with tabulator in questions-table:
        // every time a row is added, i_tab is taken and the suffix "_" + 1, 2, 3, ... is added:
        // i.e. for instance: 0, 0_1, 0_2, 1, 2, ...
        // (could also be replaced by i_tab_dyn...)
        id: i,
    }));
    return merge_table_parts(data_obj);
}

export function save_file() {
    document.querySelector("table-charter").dataset.savedSettings =
        JSON.stringify(this.params.title_table.map((x) => x.saved));
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
// from here: https://stackoverflow.com/questions/77506413/detecting-if-the-user-is-on-desktop-or-mobile-in-the-browser/77507334#77507334
export var is_mobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
    );

// from here: https://gist.github.com/thesofakillers/bcf39eaed428304ddc126ca8f12336f7
export function obj_arrays_to_array_objs(object_arrays) {
    let final_array = object_arrays[Object.keys(object_arrays)[0]].map(
        // el is unused, but needs to be defined for map to give access to index i
        (_el, i) => {
            let internal_object = {};
            Object.keys(object_arrays).forEach(
                (key) => (internal_object[key] = object_arrays[key][i]),
            );
            return internal_object;
        },
    );
    return final_array;
}

// https://stackoverflow.com/questions/17500312/is-there-some-way-i-can-join-the-contents-of-two-javascript-arrays-much-like-i/59105862#59105862
export const left_join = (arr1, arr2, fun) => {
    return arr1.map((q) => ({ ...arr2.find((u) => fun(q) === fun(u)), ...q }));
};

function merge_table_parts(obj) {
    var res;
    res = left_join(obj.Row, obj.Tab, (x) => x.QuestNo + x.TabNo);
    res = left_join(obj.Val, res, (x) => x.QuestNo + x.RowNo);
    res = left_join(res, obj.Col, (x) => x.ColNo);
    // res = left_join(res, obj.Head, x => x.HeadNo)
    return res.sort((a, b) => a.QuestLine > b.QuestLine);
}
