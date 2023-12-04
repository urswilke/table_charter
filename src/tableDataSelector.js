import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import { xlsx_to_json_array, distinct } from './utils.js'

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
		color_scale: { type: String },
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
		this.params.rows = []
		this.choices.rows = this.params.rows
		
		this.params.tab_titles = distinct(this.data, ["TabNo", "TabTitle"]);
		
		const arr = distinct(
			this.data,
			// TODO: HeadNo is 2 for first 2 Heads => correct in crosstabser!
			["ColNo", "HeadNo", "ColTitle1", "ColTitle2"]
		);
		const first_two_titles = [... new Set(arr.map(x => x.ColTitle1))].slice(0, 2);
		this.params.arr_col_titles = arr.map(p =>
			first_two_titles.includes(p.ColTitle1)
			? { ...p, selected: true }
			: { ...p, selected: false }
		);
		this.choices.tab_titles = this.params.tab_titles[0].TabTitle
		this.choices.tab_nos = this.params.tab_titles[0].TabNo
		this.params.row_type = ["%", "counts"];
		this.choices.row_type = this.params.row_type[0];
		this.params.color_scale = ["categorical", "linear"];
		// needs to be extra reactive property (not in choices), 
		// because otherwise it's not correctly updated in the selected choice in <colorscale-selector>, 
		// when it's reset in sel_question_data():
		this.color_scale = this.params.color_scale[0];
		this.choices.color_scale = this.params.color_scale[0];
		this.sel_question_data()
	}

	// Helper:
	sel_question_data() {
		this.question_data = this.data
			.filter(x => Number(x.TabNo) == this.choices.tab_nos);
		// TODO: move this somewhere else -> perhaps best to allow to choose between stacked bar / line/dot plots:
		this.choices.colorscale_disabled = !["CAT"].includes(this.question_data[0].TabType) 
		if (this.choices.colorscale_disabled) {
			this.color_scale = "categorical"
		}
	
		this.sel_header_data()
	}
	sel_header_data() {
		this.header_data = filter_sel_headers(this.question_data, this.params.arr_col_titles)

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
			this.choices.row_types = this.params.row_types.filter( ( el ) => !["Valid", "Total"].includes( el ) );
		}
		if (this.choices.row_types.includes("Detail")) {
			this.choices.row_types = ["Detail"]
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
		if (this.choices.row_types == "Summary") {
			this.choices.rows = [this.params.rows[0]]
		}
		this.sel_rows_data()
	}

	sel_rows_data() {
		this.row_data = this.num_type_detail_data
			.filter(x => (
				this.choices.rows.some(pattern => x.RowTitle1 === pattern)
			))

			// TODO: this overwrites the keeping of settings when the next chosen table has the same parameters as before...:
			const df_row_tit_val = distinct(this.row_data, ["RowTitle1", "RowValue"])
			const n_numeric_rowtitles = df_row_tit_val.reduce(
				(sum, x) => sum + Number(x.RowValue === Number(x.RowTitle1.match(/^\d+/))), 
				0
			)
			if (df_row_tit_val.length >=5 & n_numeric_rowtitles / df_row_tit_val.length >= 0.4 & this.choices.row_types == "Detail") {
				this.color_scale = "linear"
			} else {
				this.color_scale = "categorical"
			}

			this.plot_data = this.row_data
	}
	
	// Talk to parent:
	_update_plot_data() {
		const options = {
			detail: {
				data: {
					plot_data: this.plot_data,
					choices: this.choices,
					color_scale: this.color_scale
				}
			},
			bubbles: true,
			composed: true,
		};

		this.dispatchEvent(new CustomEvent('update-data', options));

	}

	// Listen to children:
	_on_header_update(e) {
		this.params.arr_col_titles = e.detail.arr_col_titles;
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
		this.color_scale = e.detail.chosen_colorscale;
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
					<div>
						<question-selector 					
							@update-question="${this._on_question_update}" 		
							.chosen_tab_no=${this.choices.tab_nos} 
							.all_questions=${this.params.tab_titles}>
						</question-selector>
					</div>
					<table>
						<tr>
							<th>header</th>
							<th>sub-header</th>
						</tr>
						<tr>
							<th><column-selector 		
								@update-header="${this._on_header_update}" 		
								.arr_col_titles=${this.params.arr_col_titles}>	   																
							</column-selector></th>
						</tr>
					</table>
					<table>
						<tr>
							<th>abs / %</th>
							<th>row types</th>
							<th>rows</th>
						</tr>
						<tr>
							<th><num_type-selector 		
								@update-num_type="${this._on_num_type_update}"
								.all_num_types=${this.params.row_type}
								.chosen_num_type=${this.choices.row_type}>
							</num_type-selector></th>
							<th><row_types-selector 	
								@update-row_types="${this._on_row_types_update}" 	
								.all_row_types=${this.params.row_types}
								.chosen_row_types=${this.choices.row_types}>
							</row_types-selector></th>
							<th><rows-selector 			
								@update-rows="${this._on_rows_update}"
								.all_rows=${this.params.rows}
								.chosen_rows=${this.choices.rows}>
							</rows-selector></th>
						</tr>
					</table>
					<colorscale-selector 				
						@update-colorscale="${this._on_colorscale_update}" 	
						.all_colorscales=${this.params.color_scale}	
						.chosen_colorscale=${this.color_scale} 
						.colorscale_disabled=${this.choices.colorscale_disabled}>
					</colorscale-selector>
					<xy-selector 	  					
						@update-xy="${this._on_xy_update}"
						.chosen_xy=${this.choices.xy}>
					</xy-selector>
				`
			)}
		`;
	}

	static styles = [
		unsafeCSS(sharedStyles),
		css`
			table {
				max-width: 100%;
			}
			th {
				vertical-align: top;
			}
			option:checked {
				background: red linear-gradient(#333,#333);
			}
		`
	];

}

window.customElements.define('table-data-selector', TableDataSelector)

function filter_sel_headers(data, arr_col_titles) {
	const arr_sel = arr_col_titles.filter(x => x.selected);
	const col_fun2 = x => x.ColTitle2 || x.ColTitle1
	const col_fun1 = x => x.ColTitle1
	const res = data.filter(x => 
		[... new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)) &
		[... new Set(arr_sel.map(col_fun1))].includes(col_fun1(x))
	);
	return res;
}