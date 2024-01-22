import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';

import { xlsx_to_json_array, distinct } from './utils.js'

import './selectors/question_selector.js'
import './selectors/multi_selector.js'
import './selectors/num_type_selector.js'
import './selectors/colorscale_selector.js'
import './selectors/further_options_selector.js'

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
		this.params.tab_indices = [...new Set(this.data.map((d) => d.TabNo))];
		// this.params.tab_titles = [...new Set(this.data.map(d => ({TabNo: d.TabNo, TabTitle: d.TabTitle})))].map(d => d.TabTitle);
		// this.params.tab_titles = [...new Set(this.data.map(d => d.TabTitle))];
		
		this.params.tab_titles = distinct(this.data, ["TabNo", "TabTitle"]);
		
		this.params.header_table = gen_header_table(this.data)
		this.choices.tab_titles = this.params.tab_titles[0].TabTitle
		this.choices.tab_nos = this.params.tab_titles[0].TabNo
		this.params.row_type = ["%", "n"];
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
			(sum, x) => sum + Number(x.RowValue === Number(x.RowTitle1.match(/^\d+/))),
			0
		)
		if (
			df_row_tit_val.length >= 5 & 
			n_numeric_rowtitles / df_row_tit_val.length >= 0.4 & 
			[... new Set(this.params.row_table.filter(x => x.selected).map(x => x.RowContent))] == "Detail"
		) {
			this.color_scale = "linear"
		} else {
			this.color_scale = "categorical"
		}

		this.plot_data = this.rows_data
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
		this.params.header_table = e.detail.prop_table;
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
					<multi-selector 		
						.mainsel_text = ${"header"}
						.subsel_text = ${"sub-header"}
						.parent_string = ${"ColTitle1"}
						.children_fun = ${(x) => x.ColTitle2 || x.ColTitle1}
						@update-multi-select="${this._on_header_update}" 		
						.prop_table=${this.params.header_table}>	   																
					</multi-selector>
					<!-- https://stackoverflow.com/a/2062264 -->
					<span class="clear"></span>
					<num_type-selector 		
						@update-num_type="${this._on_num_type_update}"
						.all_num_types=${this.params.row_type}
						.chosen_num_type=${this.choices.row_type}>
					</num_type-selector>
					<span class="clear"></span>
					<multi-selector 		
						.mainsel_text = ${"row type(s)"}
						.subsel_text = ${"row(s)"}
						.parent_string = ${"RowContent"}
						.children_fun = ${(x) => x.RowTitle1}
						@update-multi-select="${this._on_rows_update}" 		
						.prop_table=${this.params.row_table}>	   																
					</multi-selector>
					<span class="clear"></span>
					<colorscale-selector 				
						@update-colorscale="${this._on_colorscale_update}" 	
						.all_colorscales=${this.params.color_scale}	
						.chosen_colorscale=${this.color_scale} 
						.colorscale_disabled=${this.choices.colorscale_disabled}>
					</colorscale-selector>
					<further-options-selector 	  					
						@update-xy="${this._on_xy_update}"
						@update-plot_type="${this._on_plot_type_update}"
						.xy=${this.choices.xy}
						.plot_type=${this.choices.plot_type}>
					</further-options-selector>
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
		`
	];

}

window.customElements.define('table-data-selector', TableDataSelector)

function gen_header_table(data) {
	const arr = distinct(
		data,
		// TODO: HeadNo is 2 for first 2 Heads => correct in crosstabser!
		["ColNo", "HeadNo", "ColTitle1", "ColTitle2"]
	);
	const first_two_titles = [... new Set(arr.map(x => x.ColTitle1))].slice(0, 2);
	return arr.map(p =>
		first_two_titles.includes(p.ColTitle1)
		? { ...p, selected: true }
		: { ...p, selected: false }
	);
}

function gen_row_table(data) {
	const arr = distinct(data, ["RowContent", "RowTitle1"])
	const row_contents = [... new Set(arr.map(x => x.RowContent))];
	var types_to_take;
	if (row_contents.includes("Detail")) {
		types_to_take = ["Detail"]
	} else if (row_contents.includes("Summary")) {
		types_to_take = ["Summary"]
	} else {
		// setdiff:
		types_to_take = row_contents.filter(x => !["Valid", "Total"].includes(x));
	}
	return arr.map(p =>
		types_to_take.includes(p.RowContent)
		? { ...p, selected: true }
		: { ...p, selected: false }
	);
}

function filter_sel_headers(data, header_table) {
	const arr_sel = header_table.filter(x => x.selected);
	const col_fun2 = x => x.ColTitle2 || x.ColTitle1
	const col_fun1 = x => x.ColTitle1
	const res = data.filter(x => 
		[... new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)) &
		[... new Set(arr_sel.map(col_fun1))].includes(col_fun1(x))
	);
	return res;
}
function filter_sel_rows(data, header_table) {
	const arr_sel = header_table.filter(x => x.selected);
	const col_fun2 = x => x.RowTitle1
	const col_fun1 = x => x.RowContent
	const res = data.filter(x => 
		[... new Set(arr_sel.map(col_fun2))].includes(col_fun2(x)) &
		[... new Set(arr_sel.map(col_fun1))].includes(col_fun1(x))
	);
	return res;
}

function gen_plot_type_string(tab_sel_obj) {
	let tab_type = tab_sel_obj.num_type_data[0].TabType;
	if (
		tab_type === "CAT" ||
		// mw question that has a column TabDetails with the value "100percent" in the 1st row and percent values are selected:
		// TODO: implement in crosstabser!
		(tab_type === "MW" & tab_sel_obj.num_type_data[0].TabDetails === "100percent" & tab_sel_obj.choices.row_type === "%")

	) {
		return "bar";
	}
	if (tab_type === "MCG") {
		return "line";
	}
	if (tab_type === "MDG") {
		return "line";
	}
	if (tab_type === "MW") {
		return "line";
	}
	else {
		alert("Table type " + tab_type + " not implemented.")
	}	
	
}