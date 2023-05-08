import "./action-button.js"
import './ojs-plot.js'
import { xlsx_to_json_array } from './readExcel.js'
import './tableBookData.js'

import * as Plot from "@observablehq/plot";

import sharedStyles from './styles.css?inline';


var xlsx_data;
let table_book_data;

function plot_histogramm() {
    let abs_or_perc = document.getElementById("abs-or-percent").value;

	let remove_vals = ["GESAMT", "GÜLTIGE FÄLLE"];
	const data = xlsx_data
		.filter(x => x.RowSubtitle === abs_or_perc)
		.filter(x => !remove_vals.includes(x.RowTitle))
		.filter(x => !remove_vals.includes(x.ColTitle));
	barChart.chartOptions = {
		// style: {
		// 	color: "var(--plot-primary)",
		// },
		color: {
			type: "categorical",
			legend: true
		},
		marks: [
			Plot.barY(data, {x: "RowTitle", y: "Value", fill: "ColTitle"})
		]
	}
}

function extract_tables_data(xlsx_data) {
    let tab_indices = [...new Set(xlsx_data.map((d) => d.TabNo))];
    let tab_titles = [...new Set(xlsx_data.map((d) => d.TabTitel1))];
    let col_titles = [...new Set(xlsx_data.map((d) => d.ColTitle))];
    let col_subtitles = [...new Set(xlsx_data.map((d) => d.ColSubtitle))];
    return {
        tab_indices,
        tab_titles,
        col_titles,
        col_subtitles
    }
}
const barChart = document.querySelector('#rect-plot');
barChart.appStyles = sharedStyles;
const filePath = 'Mappe1.xlsx';
const sheet = "Daten";

// helper function to assign value to a global variable:
async function upload_xlsx(e) {
    xlsx_data = await xlsx_to_json_array(e);
    console.log(xlsx_data)
    table_book_data = extract_tables_data(xlsx_data)
    console.log(table_book_data)
    plot_histogramm()
}
document.getElementById("file-upload").addEventListener('change', upload_xlsx);




const regenButton = document.querySelector("#regen")
regenButton.onClick = plot_histogramm;


