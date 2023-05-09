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

const barChart = document.querySelector('#rect-plot');
barChart.appStyles = sharedStyles;
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


