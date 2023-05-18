import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import './ojs-plot.js'
import './tableBookData.js'
import { gen_plot_options } from './gen_plot_types.js'


const inspect = true // set to true for some console.log msgs

export class TableCharter extends LitElement {

	static properties = {
        plot_data: { type: Array },
    };

	constructor() {
		super()
        this.plot_data = [];
	}
    update_plot_data(e) {
        // console.log(e.detail)
        this.plot_data = e.detail.data;

    }

	render() {
		return html`
            <table-book-data @update-data="${this.update_plot_data}"></table-book-data>
            <ojs-plot .chartOptions=${gen_plot_options(this.plot_data)}></ojs-plot>
		`;

	}
}

window.customElements.define('table-charter', TableCharter)
