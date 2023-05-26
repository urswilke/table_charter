import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import { concat_tab_titles, xlsx_to_json_array } from './utils.js'

import './selectors/question_selector.js'
import './selectors/header_selector.js'
import './selectors/rowtype_selector.js'
import './selectors/hide_rows_selector.js'
import './selectors/colorscale_selector.js'

import sharedStyles from './components.css?inline';

const inspect = true // set to true for some console.log msgs

export class TableDataSelector extends LitElement {

	static properties = {
		plot_data: { type: Array },
		params: { type: Object },
		choices: { type: Object },
	};

	// Initialization:
	init_tablebook_data(data) {
		this.data = data;
		this.init_params();
		this._update_plot_data()
	}

	init_params() {
		this.params = {};
		this.choices = {};
		this.params.tab_indices = [...new Set(this.data.map((d) => d.TabNo))];
		this.params.tab_titles = [...new Set(this.data.map(d => concat_tab_titles(d)))];
		this.params.col_titles = [...new Set(this.data.map((d) => d.ColTitle))];
		this.choices.tab_titles = this.params.tab_titles[0]
		this.choices.col_titles = this.params.col_titles.slice(0, 2)
		this.set_subtables_data()
		this.set_rowtype_choices()
		this.params.hide_rows = ["GESAMT", "GÜLTIGE FÄLLE"];
		this.params.color_scale = ["categorical", "linear"];
		this.choices.row_type = this.params.row_type[0]
		this.choices.hide_rows = this.params.hide_rows
		this.choices.color_scale = this.params.color_scale[0]

	}

	// Helper:
	set_subtables_data() {
		this.subtables_data = this.data
			.filter(x => concat_tab_titles(x) === this.choices.tab_titles)
			.filter(x => this.choices.col_titles.includes(x.ColTitle));

	}
	set_rowtype_choices() {
		let row_type = [...new Set(this.subtables_data.map((d) => d.RowSubtitle))];
		// swap first 2 elements:
		// https://stackoverflow.com/a/872317
		[row_type[0], row_type[1]] = [row_type[1], row_type[0]];
		this.params.row_type = [...row_type];
		this.choices.row_type = this.params.row_type[0];
	}

	// Talk to parent:
	_update_plot_data() {
		this.plot_data = this.subtables_data
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

	// Listen to children:
	_on_header_update(e) {
		this.choices.col_titles = e.detail.chosen_header;
		this.set_subtables_data()
		this._update_plot_data()
	}
	_on_question_update(e) {
		this.choices.tab_titles = e.detail.chosen_question;
		this.set_subtables_data()
		this.set_rowtype_choices()
		this._update_plot_data()
	}
	_on_rowtype_update(e) {
		this.choices.row_type = e.detail.chosen_rowtype;
		this._update_plot_data()
	}
	_on_hide_rows_update(e) {
		this.choices.hide_rows = e.detail.chosen_hide_rows;
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
				this.params === undefined,
				() => html`<div></div>`,
				() => html`
						<question-selector 		@update-question="${this._on_question_update}" 		.all_questions=${this.params.tab_titles} 	.chosen_question=${this.choices.tab_titles}>   </question-selector>
						<column-selector 		@update-header="${this._on_header_update}" 			.all_headers=${this.params.col_titles} 		.chosen_header=${this.choices.col_titles}>	   </column-selector>
						<rowtype-selector 		@update-rowtype="${this._on_rowtype_update}" 		.all_rowtypes=${this.params.row_type} 		.chosen_rowtype=${this.choices.row_type}>	   </rowtype-selector>
						<hide_rows-selector 	@update-hide_rows="${this._on_hide_rows_update}" 	.all_hide_rows=${this.params.hide_rows} 	.chosen_hide_rows=${this.choices.hide_rows}>   </hide_rows-selector>
						<colorscale-selector 	@update-colorscale="${this._on_colorscale_update}" 	.all_colorscales=${this.params.color_scale}	.chosen_colorscale=${this.choices.color_scale}></colorscale-selector>
					`
			)}
		`;
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

window.customElements.define('table-data-selector', TableDataSelector)
