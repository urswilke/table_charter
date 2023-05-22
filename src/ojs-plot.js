import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { gen_plot_options } from './gen_plot_types.js'
import { concat_tab_titles } from './tableBookData.js'

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
		this.chartTitle = !!val.plot_data ? concat_tab_titles(val.plot_data[0], "\n") : ""
	}


	render() {

		inspect && console.log("render")

		const renderedPlot = this.chartOptions && Plot.plot(this.chartOptions)

		return when(this.chartOptions === null,
			() => html`<div></div>`,
			() => html`<div>
			<h3 class="primary multi-line-header">${this.chartTitle}</h3>
			${renderedPlot}
			</div>`
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
