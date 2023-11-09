import { LitElement, html } from 'lit'
import { when } from 'lit/directives/when.js';
import { gen_plot_options } from './gen_plot_types.js'

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


	render() {

		inspect && console.log("render")

		const renderedPlot = this.chartOptions && Plot.plot(this.chartOptions)

		return when(this.chartOptions === null,
			() => html`<div></div>`,
			() => html`<div>
			<h4 class="primary multi-line-header">${this.chartTitle}</h4>
			${renderedPlot}
			</div>`
		)

	}
}



window.customElements.define('ojs-plot', OJSPlot)
