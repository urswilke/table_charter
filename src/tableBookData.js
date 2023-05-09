import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import sharedStyles from './components.css?inline';

const inspect = true // set to true for some console.log msgs

export class TableBookData extends LitElement {

	static properties = {
		data: { type: Array },
		params: { type: Object },
		choices: { type: Object },
		};

	constructor() {

		super()
        this.data = [];
        this.params = {};
        this.choices = {};
	}

	set data(val) {
		let oldVal = this.data;
		this.requestUpdate('data', oldVal);
		this.params = extract_tables_book_params(val);
		this.choices = isEmpty(this.params) ? {} : init_choices(this.params);
	}

	
	render() {

		inspect && console.log("render")
		inspect && console.log(this)

		return when(isEmpty(this.params),
			() => html`<div></div>`,
			() => html`
				<div>
					<select id="RowSel">
						${this.params.tab_titles.map(
							(col, i) => html`
								<option value="${col}">${col}</option>
							`
						)}
					</select>
				</div>
			`);

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

// https://stackoverflow.com/a/679937
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
function extract_tables_book_params(xlsx_data) {
	if (xlsx_data.length === 0) {
		return {};
	}
    let tab_indices = [...new Set(xlsx_data.map((d) => d.TabNo))];
    let tab_titles = [...new Set(xlsx_data.map((d) => d.TabTitel1))];
    let col_titles = [...new Set(xlsx_data.map((d) => d.ColTitle).filter((d) => d !== "GESAMT"))];
    let col_subtitles = [...new Set(xlsx_data.map((d) => d.ColSubtitle))];
    return {
        tab_indices,
        tab_titles,
        col_titles,
        col_subtitles
    }
}

// https://stackoverflow.com/a/14810722
const objectMap = (obj, fn) =>
	Object.fromEntries(
		Object.entries(obj).map(
			([k, v], i) => [k, fn(v, k, i)]
		)
)
function init_choices(params) {
	return objectMap(params, v => v[0]);
}

window.customElements.define('table-book-data', TableBookData)
