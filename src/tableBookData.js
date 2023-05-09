import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import sharedStyles from './components.css?inline';

const inspect = true // set to true for some console.log msgs

export class TableBookData extends LitElement {

	static properties = {
		data: { type: Object },
		};

	constructor() {

		super()
        this.data = {};
	}

	
	render() {

		inspect && console.log("render")
		inspect && console.log(this)

		return html`
		<div>
			<select id="RowSel">
				${this.data.tab_titles.map(
					(col, i) => html`
						<option value="${col}">${col}</option>
					`
				)}
			</select>
		</div>
	`;

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

window.customElements.define('table-book-data', TableBookData)
