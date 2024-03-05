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
import data_compressed from './example_compressed.json';
import { produce } from "immer"

const data = prepare_data(data_compressed);
const inspect = false // set to true for some console.log msgs

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
	
	// not in constructor cause need to wait for triggering sending the data (via update-data event) to ojs-plot after it has been initilized..:
	connectedCallback() {
		super.connectedCallback()
		this.init_tablebook_data(data);
	}

	init_params() {
		this.params = {};
		this.choices = {};
		this.choices.xy = "x"
		
		this.choices.header_table = gen_header_table(this.data)
		
		this.params.title_table = distinct(this.data, ["i_tab", "TabTitle"]);
		
		let title_table = this.params.title_table[0]
		this.choices.i_tab = title_table.i_tab
		this.i_tab = title_table.i_tab
		this.choices.tab_title = title_table.TabTitle
		this.params.row_type = ["%", "n"];
		this.choices.row_type = this.params.row_type[0];
		this.params.color_scale = ["categorical", "ordinal"];
		this.choices.collapsed_view = true;
		this.choices.show_n = false;
		this.choices.separate_headers = true;
		this.choices.font_size = 16;
		this.saved = new Array(this.params.title_table.length).fill({})
		this.sel_question_data()
	}

	// Helper:
	sel_question_data() {
		this.question_data = this.data
			.filter(x => x.i_tab == this.i_tab);
		const colorscale_disabled = !["CAT"].includes(this.question_data[0].TabType);
		this.update_choices({
			colorscale_disabled: colorscale_disabled,
			plot_type: gen_plot_type_string(this),
			...(colorscale_disabled && {
				color_scale: "categorical",
				...this.saved[this.i_tab],
			}),
		})
		this.sel_header_data()
	}
	sel_header_data() {
		this.header_data = filter_sel_headers(
			this.question_data, 
			this.choices.header_table
		)
		this.toggle_filtered_class('#header-multi-sel', this.question_data, this.header_data)
		
		this.sel_num_type_data()
	}
	sel_num_type_data() {
		const row_type = this.choices.row_type
		this.num_type_data = this.header_data
			.filter(x => 
				row_type === "n" ? 
				x.RowAbsPercent == "Abs" : 
				x.RowAbsPercent != "Abs"
			)
		;
		this.toggle_filtered_class('num_type-selector', this.header_data, this.num_type_data)
		
		this.update_choices({
			row_table: gen_row_table(this.num_type_data)
		})

		this.sel_rows_data()
	}
	sel_rows_data() {
		this.rows_data = filter_sel_rows(this.num_type_data, this.choices.row_table)
		this.toggle_filtered_class('#row-multi-sel', this.num_type_data, this.rows_data)
	
		const df_row_tit_val = distinct(this.rows_data, ["RowTitle1", "RowValue"])
		const n_numeric_rowtitles = df_row_tit_val.reduce(
			(sum, x) => sum + Number(x.RowValue === Number(x.RowTitle1.match(/^-?\d+/))),
			0
		)
		// TODO: find cleaner solution!...:
		if (
			// only when object is empty:
			Object.keys(this.saved[this.i_tab]).length === 0
		) {
			let color_scale;
			if (
				// df_row_tit_val.length >= 5 & 
				n_numeric_rowtitles / df_row_tit_val.length >= 0.6 & 
				[... new Set(this.choices.row_table.filter(x => x.selected).map(x => x.RowContent))] == "Detail"
			) {
				color_scale = "ordinal"
			} else {
				color_scale = "categorical"
			}
			this.update_choices({
				color_scale: color_scale,
			})
			this.init_color_scheme()
			this.params.color_schemes = all_color_schemes[color_scale];
		}

		this.plot_data = this.rows_data
	}
	init_color_scheme() {
		this.update_choices({
			color_scheme: this.choices.color_scale === "categorical" ?
				"Tableau10" :
				"Turbo"
		})
	}
	update_choices(obj) {
		this.choices = produce(this.choices, draft => (
			{...draft, ...obj}
		))
	}
	toggle_filtered_class(selector_string, input_data, output_data) {
		if (input_data.length === 0) {
			return;
		}
		const html_el = this.renderRoot?.querySelector(selector_string);
		if (output_data.length === 0) {
			html_el?.classList.add("all-filtered")
		} else {
			html_el?.classList.remove("all-filtered")
		}

	}
	
	// Talk to parent:
	_update_plot_data() {
		// this.saved[this.i_tab] = {...this.saved[this.i_tab], ...this.choices}
		this.saved[this.i_tab] = produce(this.saved[this.i_tab], draft => ({
			...draft, ...this.choices
		})) 
		const options = {
			detail: {
				data: {
					plot_data: this.plot_data,
					choices: this.saved[this.i_tab],
				}
			},
			bubbles: true,
			composed: true,
		};

		this.dispatchEvent(new CustomEvent('update-data', options));

	}

	// Listen to children:
	_on_header_update(e) {
		this.update_choices({
			header_table: e.detail.prop_table
		})
		this.sel_header_data()
		this._update_plot_data()
	}
	_on_question_update(e) {
		let title_table = this.params.title_table[e.detail.chosen_tab_no];
		this.i_tab = Number(title_table.i_tab);
		this.update_choices({
			...this.saved[this.i_tab],
			i_tab: this.i_tab,
			tab_title: title_table.TabTitle
		})
		// for this to work properly, it needs i_tab in the data to be an ascending sequence of 1, 2, ..., N:
		this.sel_question_data()
		this._update_plot_data()
	}
	_on_num_type_update(e) {
		this.update_choices({
			row_type: e.detail.chosen_num_type
		})
		this.sel_num_type_data()
		this._update_plot_data()
	}
	_on_rows_update(e) {
		this.update_choices({
			row_table: e.detail.prop_table
		})
	
		const arr_selected = this.choices.row_table.filter(x => x.selected)
		if (
			e.detail.from === "parents" && 
			[... new Set(arr_selected.map(x => x.RowContent))] == "Summary"
		) {
			const summary_titles = [... new Set(arr_selected.map(x => x.RowTitle1))]
			this.update_choices({
				row_table: this.choices.row_table.map(p =>
					p.RowTitle1 === summary_titles[0]
					? { ...p, selected: true }
					: { ...p, selected: false }
				)
			})
		}
		
		this.sel_rows_data()
		this._update_plot_data()
	}
	_on_colorscale_update(e) {
		this.update_choices({
			color_scale: e.detail.chosen_colorscale
		})
		this.params.color_schemes = all_color_schemes[this.choices.color_scale];
		this.init_color_scheme()

		this._update_plot_data()
	}
	_on_colorscheme_update(e) {
		this.update_choices({
			color_scheme: e.detail.chosen_colorscheme
		})
		this._update_plot_data()
	}
	_on_xy_update(e) {
		this.update_choices({
			xy: e.detail.xy
		})
		this._update_plot_data()
	}
	_on_checkbox_update(e) {
		this.update_choices({
			show_n: e.detail.show_n,
			separate_headers: e.detail.separate_headers,
		})
		this._update_plot_data()
	}
	_on_font_size_update(e) {
		this.update_choices({
			font_size: e.detail.font_size
		})
		this._update_plot_data()
	}
	_on_plot_type_update(e) {
		this.update_choices({
			plot_type: e.detail.plot_type
		})
		this._update_plot_data()
	}
	_on_expand() {
		this.update_choices({
			collapsed_view: !this.choices.collapsed_view
		})
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
					<label>Show absolute / percent values</label>
					<num_type-selector
						class="show_in_same_line" 		
						@update-num_type="${this._on_num_type_update}"
						.all_num_types=${this.params.row_type}
						.chosen_num_type=${this.choices.row_type}>
					</num_type-selector>
				</div>
				<div>
					<label>Question</label>
					<question-selector 					
						data-test-id="question-selector"	
						@update-question="${this._on_question_update}" 		
						.chosen_tab_no=${this.choices.i_tab} 
						.all_questions=${this.params.title_table}>
					</question-selector>
				</div>
				<div id="header-multi-sel">
					<label for="headers">Headers</label>
					<multi-selector
						id="headers" 		
						data-test-id="header-selector"	
						.mainsel_text = ${"header"}
						.subsel_text = ${"sub-header"}
						.parent_string = ${"ColTitle1"}
						.children_fun = ${(x) => x.ColTitle2 != " " ? x.ColTitle2 : x.ColTitle1}
						@update-multi-select="${this._on_header_update}"
						.collapsed_view = "${this.choices.collapsed_view}"		
						.prop_table=${this.choices.header_table}>
					</multi-selector>
				</div>
				<!-- https://stackoverflow.com/a/2062264 -->
				<span class="clear"></span>
				<div id="row-multi-sel">
					<label for="rows">Rows</label>
					<multi-selector 
						id="rows"		
						data-test-id="row-selector"	
						.mainsel_text = ${"type(s)"}
						.subsel_text = ${"row(s)"}
						.parent_string = ${"RowContent"}
						.children_fun = ${(x) => x.RowTitle1}
						@update-multi-select="${this._on_rows_update}" 		
						.collapsed_view = "${this.choices.collapsed_view}"		
						.prop_table=${this.choices.row_table}>	   																
					</multi-selector>
				</div>
				<span class="clear"></span>
				<div class="parent">
					<label>Settings</label>
					<button
						data-test-id="show-hide-button"
						@click="${this._on_expand}">
						${this.choices.collapsed_view ? "Show advanced settings" : "Hide advanced settings"}
					</button>
					<div class=${!this.choices.collapsed_view ? "" : "hide"}>
						<label for="colors">Color</label>
						<colorscale-selector 	
							id="colors"		
							data-test-id="color-scale-selector"	
							@update-colorscale="${this._on_colorscale_update}" 	
							@update-colorscheme="${this._on_colorscheme_update}" 	
							.all_colorscales=${this.params.color_scale}	
							.chosen_colorscale=${this.choices.color_scale}  
							.colorscale_disabled=${this.choices.colorscale_disabled}
							.all_colorschemes=${this.params.color_schemes}	
							.chosen_colorscheme=${this.choices.color_scheme}>
						</colorscale-selector>
					</div>
					<further-options-selector
						@update-xy="${this._on_xy_update}"
						@update-plot_type="${this._on_plot_type_update}"
						@update-checkboxes="${this._on_checkbox_update}"
						@update-font-size="${this._on_font_size_update}"
						.xy=${this.choices.xy}
						.plot_type=${this.choices.plot_type}
						.show_n=${this.choices.show_n}
						.separate_headers=${this.choices.separate_headers}
						.font_size=${this.choices.font_size}
					>
					</further-options-selector>
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
				color: white;
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
