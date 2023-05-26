import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { xlsx_to_json_array } from './readExcel.js'
import './question_selector.js'
import './header_selector.js'
import './rowtype_selector.js'
import './hide_rows_selector.js'
import './colorscale_selector.js'

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
		this.init_params();
		this._update_plot_data()
	}

	init_params() {
		this.params.tab_indices = [...new Set(this.data.map((d) => d.TabNo))];
		this.params.tab_titles = [...new Set(this.data.map(d => concat_tab_titles(d)))];
		this.params.col_titles = [...new Set(this.data.map((d) => d.ColTitle))];
		this.choices.tab_titles = this.params.tab_titles[0]
		this.choices.col_titles = this.params.col_titles[0]
		this.set_question_data()
		this.set_rowtype_choices()
		this.params.hide_rows = ["GESAMT", "GÜLTIGE FÄLLE"];
		this.params.color_scale = ["categorical", "linear"];
		this.choices.row_type = this.params.row_type[0]
		this.choices.hide_rows = this.params.hide_rows
		this.choices.color_scale = this.params.color_scale[0]

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
		this.choices.row_type = this.params.row_type[0];
	}
	_update_plot_data() {
		this.plot_data = this.question_data
			.filter(x => x.RowSubtitle === this.choices.row_type)
			.filter(x => !this.choices.hide_rows.includes(x.RowTitle))
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
		this.choices.col_titles = e.detail.chosen_header;
		inspect && console.log(this.choices.col_titles)
		this.set_question_data()
		this._update_plot_data()
	}
	_on_question_update(e) {
		this.choices.tab_titles = e.detail.chosen_question;
		inspect && console.log(this.choices.tab_titles)
		this.set_question_data()
		this.set_rowtype_choices()
		this._update_plot_data()
	}
	_on_rowtype_update(e) {
		this.choices.row_type = e.detail.chosen_rowtype;
		inspect && console.log(this.choices.row_type)
		this._update_plot_data()
	}
	_on_hide_rows_update(e) {
		this.choices.hide_rows = e.detail.chosen_hide_rows;
		inspect && console.log(this.choices.col_titles)
		this._update_plot_data()
	}
	_on_colorscale_update(e) {
		this.choices.color_scale = e.detail.chosen_colorscale;
		this._update_plot_data()
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
					<question-selector 		@update-question="${this._on_question_update}" 		.all_questions=${this.params.tab_titles} 	.chosen_question=${this.choices.tab_titles}>   </question-selector>
					<column-selector 		@update-header="${this._on_header_update}" 			.all_headers=${this.params.col_titles} 		.chosen_header=${this.choices.col_titles}>	   </column-selector>
					<rowtype-selector 		@update-rowtype="${this._on_rowtype_update}" 		.all_rowtypes=${this.params.row_type} 		.chosen_rowtype=${this.choices.row_type}>	   </rowtype-selector>
					<hide_rows-selector 	@update-hide_rows="${this._on_hide_rows_update}" 	.all_hide_rows=${this.params.hide_rows} 	.chosen_hide_rows=${this.choices.hide_rows}>   </hide_rows-selector>
					<colorscale-selector 	@update-colorscale="${this._on_colorscale_update}" 	.all_colorscales=${this.params.color_scale}	.chosen_colorscale=${this.choices.color_scale}></colorscale-selector>
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
