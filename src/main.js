import "./action-button.js"
import './ojs-plot.js'

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
