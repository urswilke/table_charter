import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { xlsx_to_json_array } from './readExcel.js'

import sharedStyles from './components.css?inline';

const inspect = true // set to true for some console.log msgs

export class TableBookData extends LitElement {

	static properties = {
        plot_data: { type: Array },
        params: { type: Object },
        choices: { type: Object },
	};

	constructor() {
		super()
		this.params = {};
		this.choices = {};
		this.data = [];
	}


	init_tablebook_data(data) {
		this.data = data;
		this.params = extract_tables_book_params(data);
		this.choices = init_choices(this.params);
		this.update_data()
	}

	set_question_data() {
		this.question_data = this.data
			.filter(x => concat_tab_titles(x) === this.choices.tab_titles)
			.filter(x => x.ColTitle === this.choices.col_titles);

	}
	set_plot_data() {
		this.set_question_data()
		let rowtype_choices = [...new Set(this.question_data.map((d) => d.RowSubtitle))];
		this.params.row_type = rowtype_choices
		// when switching tables:
		// - keep row type choice, if also existing in the next,
		// - otherwise, choose the "first" in the array
		if (!this.params.row_type.includes(this.choices.row_type)) {
			this.choices.row_type = this.params.row_type[0];
		}
		this.plot_data = this.question_data
			.filter(x => x.RowSubtitle === this.choices.row_type)
			// .filter(x => this.choices.tab_titles.includes(x.TabTitel1))
			.filter(x => !this.choices.remove_vals.includes(x.RowTitle))
			.filter(x => !this.choices.remove_vals.includes(x.ColTitle));
	}

	get _row_type() {
		return this.renderRoot?.querySelector('#rowtype-selection') ?? null;
	}
	get _header() {
		return this.renderRoot?.querySelector('#header-selection') ?? null;
	}
	get _tab() {
		return this.renderRoot?.querySelector('#tab-selection') ?? null;
	}
	_update_row_type() {
		this.choices.row_type = this._row_type.value;
		this.update_data()
	}
	
	_update_header() {
		this.choices.col_titles = this._header.value;
		this.update_data()
	}
	_update_tab() {
		this.choices.tab_titles = this._tab.value;
		this.update_data()
	}
	update_data() {
		this.set_plot_data();
		const options = {
			detail: {data: this.plot_data},
			bubbles: true,
			composed: true,
		};

		this.dispatchEvent(new CustomEvent('update-data', options));
	
	}
	
	render() {

		inspect && console.log("rendering table-book-data")
		inspect && console.log(this)

		return html`
			<input type="file" id="table-book-upload" accept=".xlsx, .xlsm"
			@change=${async function(e) {
				let data = await xlsx_to_json_array(e)
				this.init_tablebook_data(data)
			}}/>
			${when(
				isEmpty(this.params),
				() => html`<div></div>`,
				() => html`
					<label">Select question:</label>
						<select id="tab-selection" @change=${this._update_tab} .value="${this.choices.tab_titles}">
							${this.params.tab_titles.map(
								(col) => html`
									<option value="${col}">${col}</option>
								`
							)}
						</select>
						<label">Select header:</label>
						<select id="header-selection" @change=${this._update_header} .value="${this.choices.col_titles}">
							${this.params.col_titles.map(
								(col) => html`
									<option value="${col}">${col}</option>
								`
							)}
						</select>
						<label">Select row type:</label>
						<select id="rowtype-selection" @change=${this._update_row_type} .value="${this.choices.row_type}">
							${this.params.row_type.map(
								(col) => html`
									<option value="${col}">${col}</option>
								`
							)}
						</select>
				`
			)}`;
	}

	static styles = [
		unsafeCSS(sharedStyles),
	];

}

function extract_tables_book_params(xlsx_data) {
	if (xlsx_data.length === 0) {
		return {};
	}
    let tab_indices = [...new Set(xlsx_data.map((d) => d.TabNo))];
    let tab_titles = [...new Set(xlsx_data.map(d => concat_tab_titles(d)))];
    let col_titles = [...new Set(xlsx_data.map((d) => d.ColTitle).filter((d) => d !== "GESAMT"))];
    let col_subtitles = [...new Set(xlsx_data.map((d) => d.ColSubtitle))];
	let row_type = ["abs", "in %"];
	let remove_vals = ["GESAMT", "GÜLTIGE FÄLLE"];

    return {
        tab_indices,
        tab_titles,
        col_titles,
        col_subtitles,
		row_type,
		remove_vals
    }
}
// https://stackoverflow.com/a/679937
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export function concat_tab_titles(obj, sep = " - ") {
	// TODO: do not use redundant tab titles in input data from Excel!
	return [...new Set([obj.TabTitel1, obj.TabTitel2, obj.TabTitel3])]
		// remove undefined elements
		// https://stackoverflow.com/a/46125317
		.filter(item => item)
		.join(sep);
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
