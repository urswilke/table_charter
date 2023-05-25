import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { xlsx_to_json_array } from './readExcel.js'
import './header_selector.js'
import './question_selector.js'

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
	async init_tablebook_data(data) {
		this.data = data;
		this.set_params();
		this.choices = init_choices(this.params);
		this.set_plot_data();
		this.send_update_plot_data_event()
	}

	set_params() {
		this.params = {};
		this.params.tab_indices = [...new Set(this.data.map((d) => d.TabNo))];
		this.params.tab_titles = [...new Set(this.data.map(d => concat_tab_titles(d)))];
		this.params.col_titles = [...new Set(this.data.map((d) => d.ColTitle))];
		// TODO: clean up this messss!!!!
		this.choices = init_choices(this.params);
		this.set_question_data()
		this.params.col_subtitles = [...new Set(this.data.map((d) => d.ColSubtitle))];
		this.params.row_type = swapElements([...new Set(this.data.map((d) => d.RowSubtitle))], 0, 1)
		this.params.hide_rows = ["GESAMT", "GÜLTIGE FÄLLE"];
		this.params.color_scale = ["categorical", "linear"];

		// this.params = extract_tables_book_params(data);

	}

	set_question_data() {
		this.question_data = this.data
			.filter(x => concat_tab_titles(x) === this.choices.tab_titles)
			.filter(x => this.choices.col_titles.includes(x.ColTitle));

	}
	set_rowtype_choices() {
		this.params.row_type = swapElements(
			[...new Set(this.question_data.map((d) => d.RowSubtitle))],
			0, 1
		)
		// when switching tables:
		// - keep row type choice, if also existing in the next,
		// - otherwise, choose the "first" in the array
		// if (!this.params.row_type.includes(this.choices.row_type)) {
		this.choices.row_type = this.params.row_type[0];
		// }

	}
	set_plot_data() {
		this.plot_data = this.question_data
			.filter(x => x.RowSubtitle === this.choices.row_type)
			.filter(x => !this.choices.hide_rows.includes(x.RowTitle))
	}

	get _row_type() {
		return this.renderRoot?.querySelector('#rowtype-selection') ?? null;
	}
	get _hide_rows() {
		return this.renderRoot?.querySelector('#hide_rows-selection') ?? null;
	}
	get _color_scale() {
		return this.renderRoot?.querySelector('#color_scale-selection') ?? null;
	}
	_update_row_type() {
		this.choices.row_type = this._row_type.value;
		this.set_plot_data();
		this.send_update_plot_data_event()
	}

	_update_hide_rows() {
		this.choices.hide_rows = [...this._hide_rows.options].filter(option => option.selected).map(option => option.value)
		this.set_plot_data();
		this.send_update_plot_data_event()
	}

	_update_color_scale() {
		this.choices.color_scale = this._color_scale.value;
		this.send_update_plot_data_event()
	}
	send_update_plot_data_event() {
		const options = {
			detail: {
				data: {
					plot_data: this.plot_data,
					choices: this.choices
				}
			},
			bubbles: true,
			composed: true,
		};

		this.dispatchEvent(new CustomEvent('update-data', options));

	}

	_on_header_update(e) {
		this.choices.col_titles = e.detail.data.chosen_header;
		inspect && console.log(this.choices.col_titles)
		this.set_question_data()
		this.set_plot_data()
		this.send_update_plot_data_event()
	}
	_on_question_update(e) {
		this.choices.tab_titles = e.detail.data.chosen_question;
		inspect && console.log(this.choices.tab_titles)
		this.set_question_data()
		this.set_rowtype_choices()
		this.set_plot_data()
		this.send_update_plot_data_event()
	}

	render() {

		inspect && console.log("rendering table-book-data")
		inspect && console.log(this)

		return html`
			<input type="file" id="table-book-upload" accept=".xlsx, .xlsm"
			@change=${async function (e) {
				let data = await xlsx_to_json_array(e)
				this.init_tablebook_data(data)
			}}/>
			${when(
			isEmpty(this.params),
			() => html`<div></div>`,
			() => html`
					<label>Select question:</label>
					<question-selector @update-question="${this._on_question_update}" .all_questions=${this.params.tab_titles} .chosen_question=${this.choices.tab_titles}></question-selector>

					<column-selector @update-header="${this._on_header_update}" .all_headers=${this.params.col_titles} .chosen_header=${this.choices.col_titles}></column-selector>
						<label>Select row type:</label>
						<select id="rowtype-selection" @change=${this._update_row_type} .value="${this.choices.row_type}">
							${this.params.row_type.map(
				                (col) => html`
									<option value="${col}">${col}</option>
								`
			)}
						</select>
						<label>Select rows to hide:</label>
						<select id="hide_rows-selection" multiple @change=${this._update_hide_rows}>
							${this.params.hide_rows.map(
				                (col) => html`
									<option 
										?selected=${this.choices.hide_rows.includes(col)}
										value="${col}"
									>${col}</option>
								`
			)}
						</select>
						<label>Select color scale:</label>
						<select id="color_scale-selection" @change=${this._update_color_scale}>
						${this.params.color_scale.map(
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
		css`
		option:checked {
			background: red linear-gradient(#333,#333);
		}
	`
	];

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
	res['hide_rows'] = params['hide_rows']
	res['col_titles'] = params['col_titles'].slice(0, 2	);
	return res;
}

function swapElements(array, source, dest) {
	return source === dest
		? array : array.map((item, index) => index === source
			? array[dest] : index === dest
				? array[source] : item);
}
function move_second_to_first(row_type) {
	row_type.unshift(row_type.splice(1, 1)[0]);
	return [...row_type];
}

window.customElements.define('table-book-data', TableBookData)
