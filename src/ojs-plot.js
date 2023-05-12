import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { gen_plot_options } from './gen_plot_types.js'
import { concat_tab_titles } from './tableBookData.js'

import sharedStyles from './components.css?inline';
import * as Plot from "@observablehq/plot";

const inspect = true // set to true for some console.log msgs

export class OJSPlot extends LitElement {

	static properties = {
		id: { type: String },
		data: { type: Array },
		params: { type: Object },
		appStyles: { type: String },
		chartTitle: { type: String },
		chartOptions: { type: Object },
	};

	constructor() {

		super()
		
		this._data = [];
        this.params = {};
		this.chart = null
		this.appStyles = ''

		this.addEventListener('chartUpdated', (e) => {
			inspect && console.log("connectedCallback event listener")
			this.chartTitle = e.detail.value.chartTitle;
			this.chartOptions = e.detail.value.chartOptions;
		});

	}

	get _abs_or_perc() {
		return this.renderRoot?.querySelector('#abs-or-percent') ?? null;
	}
	_update_abs_or_perc() {
		console.log(this)
		this.params.abs_or_perc = this._abs_or_perc.value;
	}

	set data(val) {
		let oldVal = this._data;
		this._data = val;
		this.params.abs_or_perc = [...new Set(this.data.map(x => x.RowSubtitle))][0];
		// this.params = extract_tables_book_params(val);
		// this.choices = isEmpty(this.params) ? {} : init_choices(this.params);
		this.requestUpdate('data', oldVal);
	}
	get data() { return this._data; }
	updatePlotOptions() {
		inspect && console.log(this.data)
		this.chartOptions = gen_plot_options(this.data)
		this.chartTitle = concat_tab_titles(this.data[0])
	}

	render() {

		inspect && console.log("render")

		const renderedPlot = this.chartOptions && Plot.plot(this.chartOptions)

		return when(this.chartOptions === null,
			() => html`<div></div>`,
			() => html`<div>
			<h3 class="primary">${this.chartTitle}</h3>
			${renderedPlot}
			<label for="abs-or-percent">Choose whether to use absolute or percent values:</label>
			<select id="abs-or-percent" @change=${this._update_abs_or_perc} value="${this.params.abs_or_perc}">
				<option value="abs">abs</option>
				<option value="in %">in %</option>
			</select>
		</div>`
		)

	}

	performUpdate() {

		super.performUpdate();

		const options = {
			detail: {
				value: {
					chartTitle: this.chartTitle,
					chartOptions: this.chartOptions,
				}
			},
			bubbles: true,
			composed: true,
		};

		inspect && console.log("performUpdate dispatching event")
		this.dispatchEvent(new CustomEvent(`chartUpdated`, options));
		inspect && console.log("performUpdate event dispatched")

	}

	static styles = [
		unsafeCSS(this.appStyles),
		unsafeCSS(sharedStyles),
		css`
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
