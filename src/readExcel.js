import * as Excel from "exceljs";

export async function read_xlsx(filePath, sheet) {
    // https://stackoverflow.com/a/71004066
    const buffer = await fetch(filePath).then(res => res.arrayBuffer());
	const workbook = new Excel.Workbook();
	await workbook.xlsx.load(buffer);
	
	var sh=workbook.getWorksheet(sheet);
	const colNo = sh._columns.length;
	const rowNo = sh._rows.length;
		var colIdx = Array(colNo).fill().map((element, index) => index)
	var colNames = colIdx.map(i => sh.getRow(1).getCell(i + 1).value)
	let res = new Array(rowNo - 1);
	for (let row = 1; row < rowNo; row++) {
		res[row - 1] = {};
		for (let col = 0; col < colNames.length; col++) {
			res[row - 1][colNames[col]] = sh.getRow(row + 1).getCell(col + 1).value;
		}
	}
	return res;
}
