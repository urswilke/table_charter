import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import sharedStyles from './components.css?inline';

const inspect = false // set to true for some console.log msgs

export class TableBookData extends LitElement {

	static properties = {
		fileName: { type: String },
		sheetName: { type: String },
		columns: { type: Array },
		allColumns: { type: Array },
		colsPreSel: { type: Array },
		data: { type: Array },
	};

	constructor() {

		super()
        this.fileName = 'Mappe1.xlsx';
        this.sheetName = "Daten";
                
		this.chart = null
		this.appStyles = ''
		// this.columns = []
		// this.allColumns = []
		// this.colsPreSel = []
		this.columns = ["GESAMT", "GÜLTIGE FÄLLE"]
		this.allColumns = ["GESAMT", "GÜLTIGE FÄLLE"]
		this.colsPreSel = ["GESAMT", "GÜLTIGE FÄLLE"]
        this.data = []
	}

	get _rowSel() {
		return this.renderRoot?.getElementById('RowSel') ?? null;
	}

	
	_updateSelCols() {
		let selOptions=this.renderRoot?.getElementById('RowSel').selectedOptions
		let v = Array.from(selOptions).map(({ value }) => value);
		let unique = [...new Set(v, ...this._rowSel.value)];
		this.columns = unique;
		// console.log(unique)
	}
	
	render() {

		inspect && console.log("render")

		return html`
			<div>
				<select id="RowSel" multiple @click=${this._updateSelCols}>
					${this.allColumns.map(
                        // TODO: why doesn't pre-selection work??
						(col) => html`
							<option 
								value="${col}" 
								${this.columns.includes(col) ? 'selected' : ''}
							>
								${col}
							</option>
						`
					)}
				</select>
			</div>`;

	}

	// performUpdate() {

	// 	super.performUpdate();

	// 	const options = {
	// 		detail: {
	// 			value: {
	// 				chartTitle: this.chartTitle,
	// 				chartOptions: this.chartOptions,
	// 			}
	// 		},
	// 		bubbles: true,
	// 		composed: true,
	// 	};

	// 	inspect && console.log("performUpdate dispatching event")
	// 	this.dispatchEvent(new CustomEvent(`chartUpdated`, options));
	// 	inspect && console.log("performUpdate event dispatched")

	// }

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

window.customElements.define('table-book-data', TableBookData)
