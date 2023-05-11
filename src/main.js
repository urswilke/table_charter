import "./action-button.js"
import './ojs-plot.js'
import { xlsx_to_json_array } from './readExcel.js'
import './tableBookData.js'

import * as Plot from "@observablehq/plot";

import sharedStyles from './styles.css?inline';


var xlsx_data;
const tb_data = document.querySelector("#table-book-data")

function plot_histogramm() {
	const data = tb_data.sel_data()
	plotObj.chartOptions = {
		// style: {
		// 	color: "var(--plot-primary)",
		// },
		// use ordered sequence of unique values:
		// https://observablehq.com/@ee2dev/sorting-with-plot-a-collection-of-plot-examples#cell-102
		// https://stackoverflow.com/a/14438954
		x: {
			domain: [...new Set(data.map((x) => x.ColSubtitle))],
		},
		color: {
			type: "categorical",
			domain: [...new Set(data.map((x) => x.RowTitle))],
			legend: true
		},
		marks: [
			Plot.barY(data, {x: "ColSubtitle", y: "Value", fill: "RowTitle"})
		]
	}
}

const plotObj = document.querySelector('#plot-element');
plotObj.appStyles = sharedStyles;
const filePath = 'Mappe1.xlsx';
const sheet = "Daten";

// helper function to assign value to a global variable:
async function upload_xlsx(e) {
    xlsx_data = await xlsx_to_json_array(e);
    tb_data.data = xlsx_data
    console.log(tb_data)
    plot_histogramm()
}
document.getElementById("file-upload").addEventListener('change', upload_xlsx);




const regenButton = document.querySelector("#regen")
regenButton.onClick = plot_histogramm;


