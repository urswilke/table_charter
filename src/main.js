import "./action-button.js"
import './ojs-plot.js'
import {read_xlsx} from './readExcel.js'

import * as Plot from "@observablehq/plot";

import sharedStyles from './styles.css?inline';
const numbers = [Math.random(), Math.random()];

const rectYchart = document.querySelector('#rect-plot');
rectYchart.appStyles = sharedStyles;
rectYchart.chartOptions = {
	style: {
		color: "var(--plot-primary)",
	},
	marks: [
		Plot.rectY(numbers)
	]	
}

const regenButton = document.querySelector("#regen")
regenButton.onClick = async () => {
	const numbers = [Math.random(), Math.random()];
	rectYchart.chartOptions = {
		style: {
			color: "var(--plot-primary)",
		},
		marks: [
			Plot.rectY(numbers)
		]
	}
}


const filePath = 'Mappe1.xlsx';
const sheet = "Daten";

const sheet_table = await read_xlsx(filePath, sheet);
console.log(sheet_table);
