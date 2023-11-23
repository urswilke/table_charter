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
            <div class="column0">
            </div>
            <div class="column1">
                <table-data-selector @update-data="${this.update_plot_data}"></table-data-selector>
            </div>
            <div class="column2">
                <ojs-plot .plot_data=${this.plot_data}></ojs-plot>
            </div>
		`;

	}

    static styles = [
        css`
            * {
                box-sizing: border-box;
            }
            
            /* Create two equal columns that floats next to each other */
            .column0 {
                float: left;
                width: 5%;
                padding: 10px;
            }
            .column1 {
                float: left;
                width: 30%;
                padding: 10px;
            }
            .column2 {
                float: left;
                width: 65%;
                padding: 10px;
            }
            
            /* Clear floats after the columns */
            .row:after {
                content: "";
                display: table;
                clear: both;
            }
        `

    ]
}

window.customElements.define('table-charter', TableCharter)
