import * as XLSX from "xlsx";
export async function xlsx_to_json_array(e) {
    // from here: https://docs.sheetjs.com/docs/demos/local/file#file-api
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    return XLSX.utils.sheet_to_json(wb.Sheets["Daten"]);
}
