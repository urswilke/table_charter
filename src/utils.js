import * as XLSX from "xlsx";

export async function xlsx_to_json_array(e) {
    // from here: https://docs.sheetjs.com/docs/demos/local/file#file-api
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    return XLSX.utils.sheet_to_json(wb.Sheets["Daten"]);
}

export function concat_tab_titles(obj, sep = " - ") {
	// TODO: do not use redundant tab titles in input data from Excel!
	return [...new Set([obj.TabTitel1, obj.TabTitel2, obj.TabTitel3])]
		// remove undefined elements
		// https://stackoverflow.com/a/46125317
		.filter(item => item)
		.join(sep);
}

