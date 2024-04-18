import { LitElement, css, html } from "lit";
import { translate } from "lit-translate";

import {
    distinct,
    gen_header_table,
    gen_row_table,
    filter_sel_headers,
    filter_sel_rows,
    gen_plot_type_string,
    prepare_data,
    save_file,
    add_spaces,
} from "./utils.js";

import "./selectors/question_selector.js";
import "./selectors/multi_selector.js";
import "./selectors/num_type_selector.js";
import "./selectors/colorscale_selector.js";
import "./selectors/further_options_selector.js";
import "./selectors/advanced_options_selector.js";

import { produce } from "immer";

const inspect = false; // set to true for some console.log msgs

export class TableDataSelector extends LitElement {
    static properties = {
        html_data: { type: Array },
        plot_data: { type: Array },
        params: { type: Object },
        choices: { type: Object },
    };

    connectedCallback() {
        super.connectedCallback();
        this.init_tablebook_data();
    }

    // Initialization:
    init_tablebook_data() {
        // hack to append spaces (ColNo times to the end of ColTitle2, in order to make them unique as a function of ColNo):
        this.data = add_spaces(prepare_data(this.html_data));
        this.init_params();
        this._update_plot_data();
    }

    init_params() {
        this.params = {};
        this.choices = {};
        this.choices.xy = "x";

        this.choices.header_table = gen_header_table(this.data);

        this.params.title_table = distinct(this.data, ["i_tab", "TabTitle"]);

        let title_table = this.params.title_table[0];
        this.choices.i_tab = title_table.i_tab;
        this.i_tab = title_table.i_tab;
        // TODO: talk with Wolf how exactly to deal with the numbering of tables and clean up the mess of i_tab, i_tabs & TabNo
        this.i_tabs = this.params.title_table.map((x) => x.i_tab);
        this.choices.tab_title = title_table.TabTitle;
        this.params.row_type = ["%", "n"];
        this.choices.row_type = this.params.row_type[0];
        this.params.color_scale = ["categorical", "ordinal"];
        this.params.collapsed_view = true;
        this.choices.show_mean = true;
        this.choices.separate_headers = true;
        this.choices.font_size = 16;
        this.choices.show_text = "ifGE5";
        this.choices.axis_labels = "truncate";

        const saved_settings =
            document.querySelector("table-charter").dataset.savedSettings;
        this.saved =
            (saved_settings && JSON.parse(saved_settings)) ||
            new Array(this.params.title_table.length).fill({});
        this.sel_question_data();
    }

    // Helper:
    sel_question_data() {
        this.question_data = this.data.filter(
            (x) => x.i_tab === this.i_tabs[this.i_tab],
        );
        const colorscale_disabled = !["CAT"].includes(
            this.question_data[0].TabType,
        );
        this.update_choices({
            colorscale_disabled: colorscale_disabled,
            plot_type: gen_plot_type_string(this),
            ...this.saved[this.i_tab],
        });
        this.sel_header_data();
    }
    sel_header_data() {
        this.header_data = filter_sel_headers(
            this.question_data,
            this.choices.header_table,
        );
        this.check_if_all_filtered(
            "#header-multi-sel",
            this.question_data,
            this.header_data,
        );

        this.sel_num_type_data();
    }
    sel_num_type_data() {
        const row_type = this.choices.row_type;
        this.num_type_data = this.header_data.filter((x) =>
            row_type === "n"
                ? x.RowAbsPercent == "Abs"
                : x.RowAbsPercent != "Abs",
        );
        this.check_if_all_filtered(
            "#num-type-div",
            this.header_data,
            this.num_type_data,
        );

        this.update_choices(
            { row_table: gen_row_table(this.num_type_data) },
            !this.saved[this.i_tab].row_table,
        );

        this.sel_rows_data();
    }
    sel_rows_data() {
        this.rows_data = filter_sel_rows(
            this.num_type_data,
            this.choices.row_table,
        );
        this.check_if_all_filtered(
            "#row-multi-sel",
            this.num_type_data,
            this.rows_data,
        );

        // TODO: find cleaner solution!...:
        if (
            // only when object is empty:
            Object.keys(this.saved[this.i_tab]).length === 0
        ) {
            this.set_color_scale();
            this.init_color_scheme();
        }

        this.plot_data = this.rows_data;
    }
    set_color_scale() {
        const df_row_tit_val = distinct(this.rows_data, [
            "RowTitle1",
            "RowTitle2",
            "RowValue",
        ]);
        const n_numeric_rowtitles = df_row_tit_val.reduce(
            (sum, x) =>
                sum +
                Number(x.RowValue === Number(x.RowTitle2.match(/^-?\d+/))),
            0,
        );
        let color_scale;
        if (
            // df_row_tit_val.length >= 5 &
            (n_numeric_rowtitles / df_row_tit_val.length >= 0.6) &
            ([
                ...new Set(
                    this.choices.row_table
                        .filter((x) => x.selected)
                        .map((x) => x.RowContent),
                ),
            ] ==
                "Detail")
        ) {
            color_scale = "ordinal";
        } else {
            color_scale = "categorical";
        }
        this.update_choices({
            color_scale: color_scale,
        });
    }

    init_color_scheme() {
        this.update_choices({
            color_scheme:
                this.choices.color_scale === "categorical"
                    ? "Tableau10"
                    : "Turbo",
        });
    }
    update_choices(obj, overwrite = true) {
        if (!overwrite) {
            return;
        }
        this.choices = produce(this.choices, (draft) => ({ ...draft, ...obj }));
    }
    update_params(obj) {
        this.params = produce(this.params, (draft) => ({ ...draft, ...obj }));
    }
    check_if_all_filtered(selector_string, input_data, output_data) {
        if (input_data.length === 0) {
            return;
        }
        const html_el = this.renderRoot?.querySelector(selector_string);
        if (output_data.length === 0) {
            html_el?.classList.add("all-filtered");
        } else {
            html_el?.classList.remove("all-filtered");
        }
    }

    // Talk to parent:
    _update_plot_data() {
        // this.saved[this.i_tab] = {...this.saved[this.i_tab], ...this.choices}
        this.saved[this.i_tab] = produce(this.saved[this.i_tab], (draft) => ({
            ...draft,
            ...this.choices,
        }));
        const options = {
            detail: {
                data: {
                    plot_data: this.plot_data,
                    choices: this.saved[this.i_tab],
                },
            },
            bubbles: true,
            composed: true,
        };

        this.dispatchEvent(new CustomEvent("update-data", options));
    }

    // Listen to children:
    _on_header_update(e) {
        this.update_choices({
            header_table: e.detail.prop_table,
        });
        this.sel_header_data();
        this._update_plot_data();
    }
    _on_question_update(e) {
        let title_table = this.params.title_table.find(
            (x) => x.i_tab === Number(e.detail.chosen_tab_no),
        );
        this.i_tab = this.i_tabs.indexOf(Number(title_table.i_tab));
        this.update_choices({
            i_tab: this.i_tab,
            tab_title: title_table.TabTitle,
        });
        this.sel_question_data();
        this._update_plot_data();
    }
    _on_num_type_update(e) {
        this.update_choices({
            row_type: e.detail.chosen_num_type,
        });
        this.sel_num_type_data();
        this._update_plot_data();
    }
    _on_rows_update(e) {
        this.update_choices({
            row_table: e.detail.prop_table,
        });
        this.sel_rows_data();

        this.set_color_scale();
        this.init_color_scheme();

        this._update_plot_data();
    }
    _on_colorscale_update(e) {
        this.update_choices({
            color_scale: e.detail.chosen_colorscale,
        });
        this.init_color_scheme();

        this._update_plot_data();
    }
    _on_colorscheme_update(e) {
        this.update_choices({
            color_scheme: e.detail.chosen_colorscheme,
        });
        this._update_plot_data();
    }
    _on_xy_update(e) {
        this.update_choices({
            xy: e.detail.xy,
        });
        this._update_plot_data();
    }
    _on_checkbox_update(e) {
        this.update_choices({
            show_mean: e.detail.show_mean,
            separate_headers: e.detail.separate_headers,
        });
        this._update_plot_data();
    }
    _on_font_size_update(e) {
        this.update_choices({
            font_size: e.detail.font_size,
        });
        this._update_plot_data();
    }
    _on_show_text_update(e) {
        this.update_choices({
            show_text: e.detail.show_text,
        });
        this._update_plot_data();
    }
    _on_axis_labels_update(e) {
        this.update_choices({
            axis_labels: e.detail.axis_labels,
        });
        this._update_plot_data();
    }
    _on_plot_type_update(e) {
        this.update_choices({
            plot_type: e.detail.plot_type,
        });
        this._update_plot_data();
    }
    _on_expand() {
        this.update_params({
            collapsed_view: !this.params.collapsed_view,
        });
    }

    render() {
        inspect && console.log("rendering table-book-data");
        inspect && console.log(this);

        return this.choices === undefined
            ? html`<div></div>`
            : html`
				<div class="selector-group" id="num-type-div">
					<label>${translate("numType.label")}</label>
					<div class="content">
						<num_type-selector
							@update-num_type="${this._on_num_type_update}"
							.all_num_types=${this.params.row_type}
							.chosen_num_type=${this.choices.row_type}>
						</num_type-selector>
					</div>
				</div>
				<div class="selector-group">
					<label>${translate("question.label")}</label>
					<div class="content">
						<question-selector 					
							data-test-id="question-selector"	
							@update-question="${this._on_question_update}" 		
							.chosen_tab_no=${this.i_tabs[this.choices.i_tab]} 
							.all_questions=${this.params.title_table}>
						</question-selector>
					</div>
				</div>
				<div class="selector-group" id="header-multi-sel">
					<label for="headers">${translate("header.label")}</label>
					<div class="content">
						<multi-selector
							id="headers" 		
							data-test-id="header-selector"	
							.mainsel_text = ${translate("header.mainsel")}
							.subsel_text = ${translate("header.subsel")}
							.parent_string = ${"ColTitle1"}
							.children_fun = ${(x) => (x.ColTitle2 != " " ? x.ColTitle2 : x.ColTitle1)}
							@update-multi-select="${this._on_header_update}"
							.collapsed_view = "${this.params.collapsed_view}"		
							.prop_table=${this.choices.header_table}>
						</multi-selector>
					</div>
				</div>
				<!-- https://stackoverflow.com/a/2062264 -->
				<span class="clear"></span>
				<div class="selector-group" id="row-multi-sel">
					<label for="rows">${translate("rows.label")}</label>
					<div class="content">
						<multi-selector 
							id="rows"		
							data-test-id="row-selector"	
							.mainsel_text = ${translate("rows.mainsel")}
							.subsel_text = ${translate("rows.subsel")}
							.parent_string = ${"RowContent"}
							.children_fun = ${(x) => x.RowTitle2}
							@update-multi-select="${this._on_rows_update}" 		
							.collapsed_view = "${this.params.collapsed_view}"		
							.prop_table=${this.choices.row_table}>	   																
						</multi-selector>
					</div>
				</div>
				<span class="clear"></span>
				<button
					id="show-hide"
					data-test-id="show-hide-button"
					@click="${this._on_expand}">
					${this.params.collapsed_view ? translate("showHide.show") : translate("showHide.hide")}
				</button>
				<span class="clear"></span>
				<div 
					id="settings"
					data-test-id="settings-div"
					class=${!this.params.collapsed_view ? "" : "hide"}
				>
					<div class="selector-group">
						<label for="settings">${translate("settings.label")}</label>
						<div class="content">
							<further-options-selector
								@update-xy="${this._on_xy_update}"
								@update-plot_type="${this._on_plot_type_update}"
								.xy=${this.choices.xy}
								.plot_type=${this.choices.plot_type}
							>
							</further-options-selector>
							<hr></hr>
							<advanced-options-selector
								@update-checkboxes="${this._on_checkbox_update}"
								@update-font-size="${this._on_font_size_update}"
								@update-show-text="${this._on_show_text_update}"
								@update-axis-labels="${this._on_axis_labels_update}"
								.show_mean=${this.choices.show_mean}
								.separate_headers=${this.choices.separate_headers}
								.font_size=${this.choices.font_size}
                                .show_text=${this.choices.show_text}
                                .axis_labels=${this.choices.axis_labels}
							>
							</advanced-options-selector>
							<hr></hr>
							<colorscale-selector 	
								id="colors"		
								data-test-id="color-scale-selector"	
								@update-colorscale="${this._on_colorscale_update}" 	
								@update-colorscheme="${this._on_colorscheme_update}" 	
								.all_colorscales=${this.params.color_scale}	
								.chosen_colorscale=${this.choices.color_scale}  
								.colorscale_disabled=${this.choices.colorscale_disabled}
								.chosen_colorscheme=${this.choices.color_scheme}>
							</colorscale-selector>
							<hr></hr>
							<button @click="${save_file}">${translate("saveSettings.label")}</button>
						</div>
					</div>
				</div>
            `;
    }

    static styles = [
        css`
            span.clear {
                clear: left;
                display: block;
            }
            option:checked {
                background: red linear-gradient(#333, #333);
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
            div.selector-group,
            #show-hide {
                margin-top: 5px;
                margin-bottom: 5px;
                border-style: solid;
                border-radius: 8px;
                border-width: 2px;
            }
            div.content {
                padding: 3px;
            }
            .hide {
                display: none;
            }
            #show-hide {
                width: 100%;
            }
            .all-filtered {
                border: solid red;
            }
        `,
    ];
}

window.customElements.define("table-data-selector", TableDataSelector);
