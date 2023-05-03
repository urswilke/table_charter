import "./action-button.js"
import './ojs-plot.js'
import {read_xlsx} from './readExcel.js'

import * as Plot from "@observablehq/plot";

import sharedStyles from './styles.css?inline';

async function plot_histogramm() {
	const data = sheet_table.filter(x => x.RowSubtitle === "abs")
	const numbers = [Math.random(), Math.random()];
	rectYchart.chartOptions = {
		// style: {
		// 	color: "var(--plot-primary)",
		// },
		color: {
			type: "categorical"
		},
		marks: [
			Plot.barY(data, {x: "RowTitle", y: "Value", fill: "ColTitle"})
		]
	}
	
}


const rectYchart = document.querySelector('#rect-plot');
rectYchart.appStyles = sharedStyles;
const filePath = 'Mappe1.xlsx';
const sheet = "Daten";

const sheet_table = await read_xlsx(filePath, sheet);

plot_histogramm()


const regenButton = document.querySelector("#regen")
regenButton.onClick = plot_histogramm;


console.log(sheet_table);
