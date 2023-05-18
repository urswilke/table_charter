import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import './ojs-plot.js'
import './tableBookData.js'

const inspect = true // set to true for some console.log msgs

export class TableCharter extends LitElement {

	static properties = {
        plot_data: { type: Array },
    };

	constructor() {
		super()
	}

	render() {
		return when(!this.hasOwnProperty("params"),
			() => html`<div></div>`,
			() => html`
				<table-book-data id="table-book-data"></table-book-data>
				<ojs-plot id="plot-element"></ojs-plot>
		`);

	}
}

window.customElements.define('table-charter', TableCharter)
