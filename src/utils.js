import { css } from 'lit'
import { chain, pick, uniqWith, isEqual } from 'lodash';
import * as XLSX from "xlsx";
import { decompress } from 'compress-json'

export async function xlsx_to_json_array(e) {
    // from here: https://docs.sheetjs.com/docs/demos/local/file#file-api
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    return XLSX.utils.sheet_to_json(wb.Sheets["Daten"]);
}

  
export function distinct(arr, X) {
    return chain(arr.map(o => (pick(o, X))))
      .uniqWith(isEqual)
      .value();
}
  
export const buttonStyles = css`
    select[multiple] option:checked {
        background: grey linear-gradient(40deg, grey 0%, #bbb 100%);
        color: --primary
    }
    select {
        border-radius:5px;
    }
`;

export function gen_header_table(data) {
	const arr = distinct(
		data,
		// TODO: HeadNo is 2 for first 2 Heads => correct in crosstabser!
		["ColNo", "HeadNo", "ColTitle1", "ColTitle2"]
	);
	const first_two_titles = [... new Set(arr.map(x => x.ColTitle1))].slice(0, 2);
	return arr.map(p =>
		first_two_titles.includes(p.ColTitle1)
		? { ...p, selected: true }
		: { ...p, selected: false }
	);
}

export function gen_row_table(data) {
	const arr = distinct(data, ["RowContent", "RowTitle1"])
	const row_contents = [... new Set(arr.map(x => x.RowContent))];
	var types_to_take;
	if (row_contents.includes("Detail")) {
		types_to_take = ["Detail"]
	} else if (row_contents.includes("Summary")) {
		types_to_take = ["Summary"]
	} else {
		// setdiff:
		types_to_take = row_contents.filter(x => !["Valid", "Total"].includes(x));
	}
	return arr.map(p =>
		types_to_take.includes(p.RowContent)
		? { ...p, selected: true }
		: { ...p, selected: false }
	);
}

export function filter_sel_headers(data, header_table) {
	const arr_sel = header_table.filter(x => x.selected);
	const col_fun2 = x => x.ColTitle2 || x.ColTitle1
	const col_fun1 = x => x.ColTitle1
	const res = data.filter(x => 
		[... new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)) &
		[... new Set(arr_sel.map(col_fun1))].includes(col_fun1(x))
	);
	return res;
}
export function filter_sel_rows(data, header_table) {
	const arr_sel = header_table.filter(x => x.selected);
	const col_fun2 = x => x.RowTitle1
	const col_fun1 = x => x.RowContent
	const res = data.filter(x => 
		[... new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)) &
		[... new Set(arr_sel.map(col_fun1))].includes(col_fun1(x))
	);
	return res;
}

export function gen_plot_type_string(tab_sel_obj) {
	let tab_type = tab_sel_obj.num_type_data[0].TabType;
	if (
		tab_type === "CAT" ||
		// mw question that has a column TabDetails with the value "100percent" in the 1st row and percent values are selected:
		(tab_type === "MW" & tab_sel_obj.num_type_data[0].TabDetails === "100percent" & tab_sel_obj.choices.row_type === "%")

	) {
		return "bar";
	}
	if (tab_type === "MCG") {
		return "line";
	}
	if (tab_type === "MDG") {
		return "line";
	}
	if (tab_type === "MW") {
		return "line";
	}
	else {
		alert("Table type " + tab_type + " not implemented.")
	}	
	
}

export function prepare_data(data_compressed) {
	const data = decompress(data_compressed);
	const unique_combis = distinct(data, ["QuestNo", "TabNo"])
		.map(x => x.QuestNo + "-" + x.TabNo);
	
	return data.map(x => ({
		...x,
		// TODO: remove? (because it will be already done in future json data...)
		TabType: x.TabType.toUpperCase(),
		i_tab: unique_combis.indexOf(x.QuestNo + "-" + x.TabNo)
	}));
}