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
			.filter(x => concat_tab_titles(x) === this.choices.tab_titles)
			.filter(x => x.RowSubtitle === this.choices.abs_or_perc)
			.filter(x => x.ColTitle === this.choices.col_titles)
			// .filter(x => this.choices.tab_titles.includes(x.TabTitel1))
			.filter(x => !this.choices.remove_vals.includes(x.RowTitle))
			.filter(x => !this.choices.remove_vals.includes(x.ColTitle));
	}

	// https://lit.dev/docs/composition/component-composition/#passing-data-across-the-tree
	get _abs_or_perc() {
		return this.renderRoot?.querySelector('#abs-or-percent') ?? null;
	}
	get _header() {
		return this.renderRoot?.querySelector('#header-selection') ?? null;
	}
	get _tab() {
		return this.renderRoot?.querySelector('#tab-selection') ?? null;
	}
	_update_abs_or_perc() {
		this.choices.abs_or_perc = this._abs_or_perc.value;
	}
	
	_update_header() {
		this.choices.col_titles = this._header.value;
	}
	_update_tab() {
		this.choices.tab_titles = this._tab.value;
	}
	
	
	render() {

		inspect && console.log("render")
		inspect && console.log(this)

		return when(isEmpty(this.params),
			() => html`<div></div>`,
			() => html`
				<label for="tab-selection">Select question:</label>
				<select id="tab-selection" @change=${this._update_tab} value="${this.choices.tab_titles}">
					${this.params.tab_titles.map(
						(col) => html`
							<option value="${col}">${col}</option>
						`
					)}
				</select>
				<label for="header-selection">Select header:</label>
				<select id="header-selection" @change=${this._update_header} value="${this.choices.col_titles}">
					${this.params.col_titles.map(
						(col) => html`
							<option value="${col}">${col}</option>
						`
					)}
				</select>
				<label for="abs-or-percent">Choose whether to use absolute or percent values:</label>
				<select id="abs-or-percent" @change=${this._update_abs_or_perc} value="${this.choices.abs_or_perc}">
					<option value="abs">abs</option>
					<option value="in %">in %</option>
				</select>
		`);

	}

	static styles = [
		unsafeCSS(this.appStyles),
		unsafeCSS(sharedStyles),
		css`
			:host {
				// display: flex;
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
    let tab_titles = [...new Set(xlsx_data.map(concat_tab_titles))];
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

function concat_tab_titles(obj) {
	return [obj.TabTitel1, obj.TabTitel2, obj.TabTitel3]
		// remove undefined elements
		// https://stackoverflow.com/a/46125317
		.filter(item => item)
		.join(" - ");
}

// https://stackoverflow.com/a/14810722
const objectMap = (obj, fn) =>
	Object.fromEntries(
		Object.entries(obj).map(
			([k, v], i) => [k, fn(v, k, i)]
		)
)
function init_choices(params) {
	const res = objectMap(params, v => v[0]);
	res['remove_vals'] = params['remove_vals']
	return res;
}

window.customElements.define('table-book-data', TableBookData)
