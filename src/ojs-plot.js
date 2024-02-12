import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { PlotOptions } from './gen_plot_types.js'

import sharedStyles from './components.css?inline';
import * as Plot from "@observablehq/plot";

const inspect = false // set to true for some console.log msgs

export class OJSPlot extends LitElement {

	static properties = {
		plot_data: {type: Array},
		id: { type: String },
		appStyles: { type: String },
		chartTitle: { type: String },
		plot_options: { type: PlotOptions },
	};

	constructor() {

		super()
		
		this.chart = null
		this.appStyles = ''

	}

	set plot_data(val) {
		if (val.length === 0) {
			return this
		}
		this.plot_options = new PlotOptions(val)
		this.chartTitle = !!val.plot_data && val.plot_data.length > 0 ? val.plot_data[0].TabTitle: ""
	}


	render() {

		inspect && console.log("render")

		const options = this.plot_options?.options;
		const renderedPlot = options && Plot.plot(options)

		return when(options === null,
			() => html`<div></div>`,
			() => html`<div>
				<h2 
					class="primary multi-line-header"
					data-test-id="plot-header"	
				>
					${this.chartTitle}
				</h2>
				${renderedPlot}
				<span>
					<button
						data-test-id="save-button"
						@click="${this._click_save_svg}">
						save svg
					</button>

				</span>
			</div>`
		)

	}
	get _svg() {
		return this.renderRoot?.querySelector("svg[class*=plot]") ?? null;
	}

	_click_save_svg() {
		let tab_title_processed = this.plot_options.plot_data[0].TabTitle.replace(/[\./\\?%*:|"<> ]/g, '_')
		let i_tab = this.plot_options.plot_data[0].i_tab
		saveSvg(
			this._svg, 
			i_tab + "__" + tab_title_processed + '.svg'
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
			.large-font-ramp {
				font-size: 16px;
				margin-bottom: 20px;
			}
			.large-font-swatches {
				font-size: 16px;
				margin-bottom: 20px;
			}
		`
	];

}

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var svgBlob = new Blob([svgData], {type:"image/svg+xml"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
window.customElements.define('ojs-plot', OJSPlot)
