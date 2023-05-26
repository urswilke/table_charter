import { LitElement, css, html, unsafeCSS } from 'lit'
import './ojs-plot.js'
import './tableDataSelector.js'

export class TableCharter extends LitElement {

	static properties = {
        plot_data: { type: Array },
    };

	constructor() {
		super()
        this.plot_data = [];
	}

    update_plot_data(e) {
        this.plot_data = e.detail.data;
    }

    // https://lit.dev/docs/composition/component-composition/#passing-data-up-and-down-the-tree
    // good example here:
    // https://stackoverflow.com/a/72402114
	render() {
		return html`
            <table-data-selector @update-data="${this.update_plot_data}"></table-data-selector>
            <ojs-plot .plot_data=${this.plot_data}></ojs-plot>
		`;

	}
}

window.customElements.define('table-charter', TableCharter)
