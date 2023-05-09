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
		// https://lit.dev/docs/components/properties/#accessors-custom
		this._data = [];
        this.params = {};
        this.choices = {};
	}


	set data(val) {
		let oldVal = this._data;
		this._data = val;
		this.params = extract_tables_book_params(val);
		this.choices = isEmpty(this.params) ? {} : init_choices(this.params);
		this.requestUpdate('data', oldVal);
	}
	get data() { return this._data; }

	sel_data() {
		return this.data
		.filter(x => x.RowSubtitle === this.choices.abs_or_perc)
		.filter(x => this.choices.tab_titles.includes(x.TabTitel1))
		.filter(x => !this.choices.remove_vals.includes(x.RowTitle))
		.filter(x => !this.choices.remove_vals.includes(x.ColTitle));
	}

	// https://lit.dev/docs/composition/component-composition/#passing-data-across-the-tree
	get _abs_or_perc() {
		return this.renderRoot?.querySelector('#abs-or-percent') ?? null;
	}
	_update_abs_or_perc() {
		this.choices.abs_or_perc = this._abs_or_perc.value;
	}
	
	
	render() {

		inspect && console.log("render")
		inspect && console.log(this)

		return when(isEmpty(this.params),
			() => html`<div></div>`,
			() => html`
				<select id="abs-or-percent" @change=${this._update_abs_or_perc} value="${this.choices.abs_or_perc}">
					<option value="abs">abs</option>
					<option value="in %">in %</option>
				</select>
	
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
	let abs_or_perc = ["abs", "in %"];
	let remove_vals = ["GESAMT", "GÜLTIGE FÄLLE"];

    return {
        tab_indices,
        tab_titles,
        col_titles,
        col_subtitles,
		abs_or_perc,
		remove_vals
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
