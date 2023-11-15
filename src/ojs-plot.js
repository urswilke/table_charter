import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { gen_plot_options } from './gen_plot_types.js'
import { saveAs } from 'file-saver';

import sharedStyles from './components.css?inline';
import * as Plot from "@observablehq/plot";

const inspect = false // set to true for some console.log msgs

export class OJSPlot extends LitElement {

	static properties = {
		plot_data: {type: Array},
		id: { type: String },
		appStyles: { type: String },
		chartTitle: { type: String },
		chartOptions: { type: Object },
	};

	constructor() {

		super()
		
		this.chart = null
		this.appStyles = ''

	}

	set plot_data(val) {
		this.chartOptions = gen_plot_options(val)
		this.chartTitle = !!val.plot_data && val.plot_data.length > 0 ? val.plot_data[0].TabTitle: ""
	}

	save_svg(){
		// fetch('path/../assets/chart.css')
		// .then(response => response.text())
		// .then(text => {
		var svg_data = this.renderRoot?.querySelector("svg").innerHTML ?? null;   
		var head = '<svg title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">'
		// var style = "<style>" + text + "</style>"
		var full_svg = head + svg_data + "</svg>"
		var blob = new Blob([full_svg], {type: "image/svg+xml"});  
		saveAs(blob, "graph.svg");
		// })
	};
	
	
	
	render() {

		inspect && console.log("render")

		const renderedPlot = this.chartOptions && Plot.plot(this.chartOptions)

		return when(this.chartOptions === null,
			() => html`<div></div>`,
			() => html`<div>
			<h4 class="primary multi-line-header">${this.chartTitle}</h4>
			${renderedPlot}
			</div>
			<button @click=${this.save_svg}>Save svg</button>

			`
		)

	}
	static styles = [
		unsafeCSS(this.appStyles),
		unsafeCSS(sharedStyles),
		css`
			.multi-line-header {
				white-space: pre-wrap;
			}
			:host {
				display: flex;
				background-color: var(--light-plot-background, "white")
			}
			:host[dark] {
				background-color: var(--dark-plot-background, "#1c1c1e")
			}
			:host div {
				color: var(--light-plot-div-color, "white")
			}
			:host div[dark] {
				color: var(--dark-plot-div-color, "white")
			}
			:host svg {
				background: var(--light-plot-background)
			}
			:host[dark] svg {
				background: var(--dark-plot-background)
			}
		`
	];

}

window.customElements.define('ojs-plot', OJSPlot)
