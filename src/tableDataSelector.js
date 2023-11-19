import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import { xlsx_to_json_array, unique_tab_title_by_key } from './utils.js'

import './selectors/question_selector.js'
import './selectors/header_selector.js'
import './selectors/num_type_selector.js'
import './selectors/row_types_selector.js'
import './selectors/rows_selector.js'
import './selectors/colorscale_selector.js'
import './selectors/xy_selector.js'

import sharedStyles from './components.css?inline';
import data from './example.json' assert {type: 'json'};

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
		this.prep_data();
		this.init_params();
		this._update_plot_data()
	}
	
	// not in constructor cause need to wait for triggering sending the data (via update-data event) to ojs-plot after it has been initilized..:
	connectedCallback() {
		super.connectedCallback()
		this.init_tablebook_data(data);
	  }
	prep_data() {
		this.data = this.data.map((x) => ({
			...x, 
			coti_lab: [x.ColTitle1, x.ColTitle2].join("\n"),
			coti: x.ColTitle1 + " - " + x.ColTitle2,
			roti_lab: [x.RowTitle1, x.RowTitle2].join("\n"),
			roti: x.RowTitle1 + " - " + x.RowTitle2,
		}))
	}

	init_params() {
		this.params = {};
		this.choices = {};
		this.choices.xy = "x"
		this.params.tab_indices = [...new Set(this.data.map((d) => d.TabNo))];
		// this.params.tab_titles = [...new Set(this.data.map(d => ({TabNo: d.TabNo, TabTitle: d.TabTitle})))].map(d => d.TabTitle);
		// this.params.tab_titles = [...new Set(this.data.map(d => d.TabTitle))];
		
		this.params.tab_titles = unique_tab_title_by_key(this.data, 'TabNo');
		this.params.tab_nos = this.params.tab_titles.map((_, i) => i)
		this.params.col_titles = [...new Set(this.data.map((d) => d.ColTitle1))];
		this.choices.tab_titles = this.params.tab_titles[0]
		this.choices.tab_nos = 0
		this.choices.col_titles = this.params.col_titles.slice(0, 2)
		this.params.row_type = ["%", "counts"];
		this.choices.row_type = this.params.row_type[0];
		this.params.color_scale = ["categorical", "linear"];
		this.sel_question_data()
	}

	// Helper:
	sel_question_data() {
		this.question_data = this.data
			.filter(x => Number(x.TabNo) === this.choices.tab_nos + 1);
	
		this.sel_header_data()
	}
	sel_header_data() {
		this.header_data = this.question_data
			.filter(x => this.choices.col_titles.includes(x.ColTitle1));

		this.sel_num_type_data()
	}
	sel_num_type_data() {
		this.num_type_data = this.header_data
			.filter(x => 
				this.choices.row_type === "counts" ? 
				x.RowAbsPercent == "Abs" : 
				x.RowAbsPercent != "Abs"
			)
		;
		this.params.row_types = [...new Set(this.num_type_data.map((d) => d.RowContent))]

		if (!this.choices.row_types || !this.choices.row_types.every(val => this.params.row_types.includes(val)) || this.choices.row_types.length === 0) {
			this.choices.row_types = this.params.row_types.filter( ( el ) => !["Valid", "Total"].includes( el ) );;
		}
		
		this.sel_num_type_detail_data()
		}
	sel_num_type_detail_data() {
		this.num_type_detail_data = this.num_type_data
			// https://stackoverflow.com/a/59329231:	
			.filter(x => (
				this.choices.row_types.some(pattern => x.RowContent === pattern)
			))
		this.params.rows = this.choices.rows = [...new Set(this.num_type_detail_data.map((d) => d.RowTitle1))]
		this.sel_rows_data()
	}

	sel_rows_data() {
		this.row_data = this.num_type_detail_data
			.filter(x => (
				this.choices.rows.some(pattern => x.RowTitle1 === pattern)
			))
		this.plot_data = this.row_data
	}
	
	// Talk to parent:
	_update_plot_data() {
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
		this.sel_header_data()
		this._update_plot_data()
	}
	_on_question_update(e) {
		this.choices.tab_titles = this.params.tab_titles[e.detail.chosen_tab_no];
		// for this to work properly, it needs TabNo in the data to be an ascending sequence of 1, 2, ..., N:
		this.choices.tab_nos = e.detail.chosen_tab_no;
		this.sel_question_data()
		this._update_plot_data()
	}
	_on_num_type_update(e) {
		this.choices.row_type = e.detail.chosen_num_type;
		this.sel_num_type_data()
		this._update_plot_data()
	}
	_on_row_types_update(e) {
		this.choices.row_types = e.detail.chosen_row_types;
		this.sel_num_type_detail_data()
		this._update_plot_data()
	}
	_on_rows_update(e) {
		this.choices.rows = e.detail.chosen_rows;
		this.sel_rows_data()
		this._update_plot_data()
	}
	_on_colorscale_update(e) {
		this.choices.color_scale = e.detail.chosen_colorscale;
		this._update_plot_data()
	}
	_on_xy_update(e) {
		this.choices.xy = e.detail.chosen_xy;
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
						<question-selector 		@update-question="${this._on_question_update}" 		.all_tab_nos=${this.params.tab_nos} 		.chosen_tab_no=${this.choices.tab_nos} .all_questions=${this.params.tab_titles}></question-selector>
						<column-selector 		@update-header="${this._on_header_update}" 			.all_headers=${this.params.col_titles} 		.chosen_header=${this.choices.col_titles}>	   									</column-selector>
						<num_type-selector 		@update-num_type="${this._on_num_type_update}" 		.all_num_types=${this.params.row_type} 		.chosen_num_type=${this.choices.row_type}>	   									</num_type-selector>
						<row_types-selector 	@update-row_types="${this._on_row_types_update}" 	.all_row_types=${this.params.row_types} 	.chosen_row_types=${this.choices.row_types}>   									</row_types-selector>
						<rows-selector 			@update-rows="${this._on_rows_update}" 				.all_rows=${this.params.rows}				.chosen_rows=${this.choices.rows}>   											</rows-selector>
						<colorscale-selector 	@update-colorscale="${this._on_colorscale_update}" 	.all_colorscales=${this.params.color_scale}	.chosen_colorscale=${this.choices.color_scale}>									</colorscale-selector>
						<xy-selector 	  		@update-xy="${this._on_xy_update}" 					 											.chosen_xy=${this.choices.xy}>				   									</xy-selector>
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
