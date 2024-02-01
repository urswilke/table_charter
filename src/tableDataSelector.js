import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import { xlsx_to_json_array, distinct, gen_header_table, gen_row_table, filter_sel_headers, filter_sel_rows, gen_plot_type_string, prepare_data } from './utils.js'

import './selectors/question_selector.js'
import './selectors/multi_selector.js'
import './selectors/num_type_selector.js'
import './selectors/colorscale_selector.js'
import './selectors/further_options_selector.js'

import { all_color_schemes } from './gen_plot_types.js'

import sharedStyles from './components.css?inline';
import data_compressed from './example_compressed.json' assert {type: 'json'};

const data = prepare_data(data_compressed);
const inspect = false // set to true for some console.log msgs

export class TableDataSelector extends LitElement {

	static properties = {
		plot_data: { type: Array },
		params: { type: Object },
		choices: { type: Object },
		// needs to be extra reactive property (not in choices), 
		// because otherwise it's not correctly updated in the selected choice in <colorscale-selector>, 
		// when it's reset in sel_question_data():
		color_scale: { type: String },
		color_scheme: { type: String },
		collapsed_view: { type: Boolean },
	};

	// Initialization:
	init_tablebook_data(data) {
		this.data = data;
		this.init_params();
		this._update_plot_data()
	}
	
	// not in constructor cause need to wait for triggering sending the data (via update-data event) to ojs-plot after it has been initilized..:
	connectedCallback() {
		super.connectedCallback()
		this.init_tablebook_data(data);
	}

	init_params() {
		this.params = {};
		this.choices = {};
		this.choices.xy = "x"
		
		this.params.title_table = distinct(this.data, ["i_tab", "TabTitle"]);
		
		this.params.header_table = gen_header_table(this.data)
		this.choices.title_table = this.params.title_table[0].TabTitle
		this.choices.tab_nos = this.params.title_table[0].i_tab
		this.params.row_type = ["%", "n"];
		this.choices.row_type = this.params.row_type[0];
		this.params.color_scale = ["categorical", "ordinal"];
		this.collapsed_view = true;
		this.sel_question_data()
	}

	// Helper:
	sel_question_data() {
		this.question_data = this.data
			.filter(x => x.i_tab == this.choices.tab_nos);
		// TODO: move this somewhere else -> perhaps best to allow to choose between stacked bar / line/dot plots:
		this.choices.colorscale_disabled = !["CAT"].includes(this.question_data[0].TabType) 
		if (this.choices.colorscale_disabled) {
			this.color_scale = "categorical"
		}
	
		this.sel_header_data()
	}
	sel_header_data() {
		this.header_data = filter_sel_headers(this.question_data, this.params.header_table)

		this.sel_num_type_data()
	}
	sel_num_type_data() {
		this.num_type_data = this.header_data
			.filter(x => 
				this.choices.row_type === "n" ? 
				x.RowAbsPercent == "Abs" : 
				x.RowAbsPercent != "Abs"
			)
		;
		this.params.row_table = gen_row_table(this.num_type_data)
		this.choices.plot_type = gen_plot_type_string(this)
		
		this.sel_rows_data()
	}
	sel_rows_data() {
		this.rows_data = filter_sel_rows(this.num_type_data, this.params.row_table)
		
		const df_row_tit_val = distinct(this.rows_data, ["RowTitle1", "RowValue"])
		const n_numeric_rowtitles = df_row_tit_val.reduce(
			(sum, x) => sum + Number(x.RowValue === Number(x.RowTitle1.match(/^-?\d+/))),
			0
		)
		if (
			// df_row_tit_val.length >= 5 & 
			n_numeric_rowtitles / df_row_tit_val.length >= 0.6 & 
			[... new Set(this.params.row_table.filter(x => x.selected).map(x => x.RowContent))] == "Detail"
		) {
			this.color_scale = "ordinal"
		} else {
			this.color_scale = "categorical"
		}
		this.color_scheme = this.color_scale === "categorical" ?
			"Tableau10" :
			"Turbo"
		this.params.color_schemes = all_color_schemes[this.color_scale];

		this.plot_data = this.rows_data
	}
	
	// Talk to parent:
	_update_plot_data() {
		const options = {
			detail: {
				data: {
					plot_data: this.plot_data,
					choices: this.choices,
					color_scale: this.color_scale,
					color_scheme: this.color_scheme
				}
			},
			bubbles: true,
			composed: true,
		};

		this.dispatchEvent(new CustomEvent('update-data', options));

	}

	// Listen to children:
	_on_header_update(e) {
		this.params.header_table = e.detail.prop_table;
		this.sel_header_data()
		this._update_plot_data()
	}
	_on_question_update(e) {
		this.choices.title_table = this.params.title_table[e.detail.chosen_tab_no];
		// for this to work properly, it needs i_tab in the data to be an ascending sequence of 1, 2, ..., N:
		this.choices.tab_nos = e.detail.chosen_tab_no;
		this.sel_question_data()
		this._update_plot_data()
	}
	_on_num_type_update(e) {
		this.choices.row_type = e.detail.chosen_num_type;
		this.sel_num_type_data()
		this._update_plot_data()
	}
	_on_rows_update(e) {
		this.params.row_table = e.detail.prop_table;
		
		const arr_selected = this.params.row_table.filter(x => x.selected)
		if (
			e.detail.from === "parents" && 
			[... new Set(arr_selected.map(x => x.RowContent))] == "Summary"
		) {
			const summary_titles = [... new Set(arr_selected.map(x => x.RowTitle1))]
			this.params.row_table = this.params.row_table.map(p =>
				p.RowTitle1 === summary_titles[0]
				? { ...p, selected: true }
				: { ...p, selected: false }
			)
			console.log(1)
		}
		
		this.sel_rows_data()
		this._update_plot_data()
	}
	_on_colorscale_update(e) {
		this.color_scale = e.detail.chosen_colorscale;
		this.params.color_schemes = all_color_schemes[this.color_scale];
		this.color_scheme = this.color_scale === "categorical" ?
			"Tableau10 (categorical, 10 colors)" :
			"Turbo (sequential, multi-hue)"
		this._update_plot_data()
	}
	_on_colorscheme_update(e) {
		this.color_scheme = e.detail.chosen_colorscheme;
		this._update_plot_data()
	}
	_on_xy_update(e) {
		this.choices.xy = e.detail.xy;
		this._update_plot_data()
	}
	_on_plot_type_update(e) {
		this.choices.plot_type = e.detail.plot_type;
		this._update_plot_data()
	}
	_on_expand() {
		this.collapsed_view = !this.collapsed_view
	}

	render() {

		inspect && console.log("rendering table-book-data")
		inspect && console.log(this)

		return html`
			${when(
				import.meta.env.PROD,
				() => null,
				() => html`
					<input type="file" id="table-book-upload" accept=".xlsx, .xlsm"
					@change=${async function (e) {
						let data = await xlsx_to_json_array(e)
						this.init_tablebook_data(data)
					}}/>
			`)}
			${when(
				this.params === undefined,
				() => html`<div></div>`,
				() => html`
				<div class="parent">
					<label>Settings</label>
					<num_type-selector
						class="show_in_same_line" 		
						@update-num_type="${this._on_num_type_update}"
						.all_num_types=${this.params.row_type}
						.chosen_num_type=${this.choices.row_type}>
					</num_type-selector>
					<button
						@click="${this._on_expand}">
						${this.collapsed_view ? "Show advanced settings" : "Hide advanced settings"}
					</button>
					<further-options-selector
						@update-xy="${this._on_xy_update}"
						@update-plot_type="${this._on_plot_type_update}"
						.xy=${this.choices.xy}
						.plot_type=${this.choices.plot_type}>
					</further-options-selector>
				</div>
					<div>
						<label>Question</label>
						<question-selector 					
							@update-question="${this._on_question_update}" 		
							.chosen_tab_no=${this.choices.tab_nos} 
							.all_questions=${this.params.title_table}>
						</question-selector>
					</div>
					<div>
						<label for="headers">Headers</label>
						<multi-selector
							id="headers" 		
							.mainsel_text = ${"header"}
							.subsel_text = ${"sub-header"}
							.parent_string = ${"ColTitle1"}
							.children_fun = ${(x) => x.ColTitle2 != " " ? x.ColTitle2 : x.ColTitle1}
							@update-multi-select="${this._on_header_update}"
							.collapsed_view = "${this.collapsed_view}"		
							.prop_table=${this.params.header_table}>	   																
						</multi-selector>
					</div>
					<!-- https://stackoverflow.com/a/2062264 -->
					<span class="clear"></span>
					<div>
						<label for="rows">Rows</label>
						<multi-selector 
							id="rows"		
							.mainsel_text = ${"type(s)"}
							.subsel_text = ${"row(s)"}
							.parent_string = ${"RowContent"}
							.children_fun = ${(x) => x.RowTitle1}
							@update-multi-select="${this._on_rows_update}" 		
							.collapsed_view = "${this.collapsed_view}"		
							.prop_table=${this.params.row_table}>	   																
						</multi-selector>
					</div>
					<span class="clear"></span>
					<div class=${!this.collapsed_view ? "" : "hide"}>
						<label for="colors">Color</label>
						<colorscale-selector 	
							id="colors"			
							@update-colorscale="${this._on_colorscale_update}" 	
							@update-colorscheme="${this._on_colorscheme_update}" 	
							.all_colorscales=${this.params.color_scale}	
							.chosen_colorscale=${this.color_scale}  
							.colorscale_disabled=${this.choices.colorscale_disabled}
							.all_colorschemes=${this.params.color_schemes}	
							.chosen_colorscheme=${this.color_scheme}>
						</colorscale-selector>
					</div>
				`
			)}
		`;
	}

	static styles = [
		unsafeCSS(sharedStyles),
		css`
			span.clear { clear: left; display: block; }
			option:checked {
				background: red linear-gradient(#333,#333);
			}
			.show_in_same_line {
				display:inline-block;
			}
			label {
                background: #5e677b;
				display: block;
				border-top-right-radius: 6px;
				border-top-left-radius: 6px;
				padding: 5px;
				padding-left: 15px;
			}
			div {
				/* padding: 8px; */
				margin-left: 10px;
				margin-top: 10px;
				border-style: solid;
				border-radius: 8px;
			}
			.hide {
				display: none
			}
			.parent  * + * {
				margin: 3px;
			}

		`
	];

}

window.customElements.define('table-data-selector', TableDataSelector)

