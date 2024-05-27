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
    left_join,
    obj_arrays_to_array_objs,
} from "./utils.js";

import "./selectors/question_selector.js";
import "./selectors/multi_selector.js";
import "./selectors/num_type_selector.js";
import "./selectors/colorscale_selector.js";
import "./selectors/further_options_selector.js";
import "./selectors/advanced_options_selector.js";
import "./questions_table.js";

import { produce } from "immer";
import { is_mobile } from "./utils.js";

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
        // https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays/38829074#38829074
        this.table_parts = Object.fromEntries(
            Object.entries(this.html_data.data).map(([k, v]) => [
                k,
                obj_arrays_to_array_objs(v),
            ]),
        );
        // hack to append spaces (ColNo times to the end of ColTitle2, in order to make them unique as a function of ColNo):
        this.data = add_spaces(prepare_data(this.table_parts))
            // TODO: Also treat weighted tables
            .filter((x) => x.RowWeighted === "Unweighted");
        this.init_params();
        this.i_tab = 0;
        this.init_plot_settings();
    }

    init_params() {
        this.params = {};
        this.params.row_type = ["%", "n"];
        this.params.color_scale = ["categorical", "ordinal"];
        this.params.collapsed_view = true;
        this.params.title_table = this.table_parts.Tab.map((x) => ({
            ...x,
            show: true,
        }));
    }
    init_plot_settings() {
        // TODO: this will take the first table-charter element in the html,
        // if there are multiple...
        // --> find a way to refer to the lit element,
        // instead of using document.querySelector()...!
        const saved_settings =
            document.querySelector("table-charter").dataset.savedSettings;
        const saved =
            (saved_settings && JSON.parse(saved_settings)) ||
            new Array(this.params.title_table.length).fill({});
        this.update_params({
            title_table: this.params.title_table.map((x, i) => ({
                ...x,
                saved: saved[i],
            })),
        });
        this.init_choices();
    }
    init_choices() {
        this.choices = {};
        let title_table = this.params.title_table[this.i_tab];
        this.update_choices({
            i_tab: this.i_tab,
            xy: "x",
            header_table: gen_header_table(this.data),
            tab_title: title_table.TabTitle,
            row_type: this.params.row_type[0],
            n_axis: true,
            show_subtitles: false,
            show_coltitle1: true,
            show_mean: true,
            separate_headers: true,
            font_size: is_mobile ? 12 : 20,
            show_text: "ifGE5",
            axis_labels: "truncate",
        });
        this.sel_question_data();
        this._update_plot_data();
    }

    // Helper:
    sel_question_data() {
        const i_tab = this.params.title_table[this.i_tab].i_tab;
        this.question_raw_data = this.data.filter((x) => x.i_tab === i_tab);

        this.question_data = this.question_raw_data.filter((x) =>
            ["Detail", "MStatistics", "Summary"].includes(x.RowContent),
        );

        const colorscale_disabled = !["CAT"].includes(
            this.question_raw_data[0].TabType,
        );
        this.update_choices({
            colorscale_disabled: colorscale_disabled,
            plot_type: gen_plot_type_string(this),
            tab_title: this.params.title_table[this.i_tab].TabTitle,
            ...this.params.title_table[this.i_tab].saved,
        });
        // For column totals in plot:
        if (this.choices.n_axis && this.question_raw_data[0].TabType !== "MW") {
            // TODO: it feels dangerous to calculate the totals in a separate array from this.choices.header_table ...
            // -> discuss with Wolf if it's ok like this...!
            const totals = this.question_raw_data
                .filter(
                    (x) =>
                        x.RowContent === "Total" &&
                        // TODO: Treat weighted stuff more generally...!
                        ["GESAMT", "TOTAL"].includes(x.RowTitle1),
                )
                .map((x) => x.Value);
            this.update_choices({
                header_table: this.choices.header_table.map((x, i) => ({
                    ...x,
                    Value: totals[i],
                })),
            });
        }
        // For column means in plot:
        if (
            this.choices.show_mean &&
            this.question_raw_data[0].TabType === "CAT"
        ) {
            const means = this.question_raw_data
                .filter(
                    (x) =>
                        x.RowContent === "Statistics" &&
                        // TODO: HACK... tell Wolf I need this information to filter out other statistics row from data!
                        ["Mittelwert", "Mean"].includes(x.RowTitle1),
                )
                .map((x) => ({ ColNo: x.ColNo, ColMean: x.Value }));
            this.question_data = left_join(
                this.question_data,
                means,
                (x) => x.ColNo,
            );
        }

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
            !this.params.title_table[this.i_tab].saved.row_table,
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
            Object.keys(this.params.title_table[this.i_tab].saved).length === 0
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
    show_hide_questions_table() {
        this.update_params({
            show_questions_table: !this.params.show_questions_table,
        });
    }

    // Talk to parent:
    _update_plot_data() {
        // this.params.title_table[this.i_tab].saved = {...this.params.title_table[this.i_tab].saved, ...this.choices}
        this.params = produce(this.params, (draft) => {
            draft.title_table[this.i_tab].saved = {
                ...draft.title_table[this.i_tab].saved,
                ...this.choices,
            };
        });
        const options = {
            detail: {
                data: {
                    plot_data: this.plot_data,
                    choices: this.params.title_table[this.i_tab].saved,
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
            (x) => x.i_tab_dyn === Number(e.detail.chosen_tab_no),
        );
        this.i_tab = title_table.i_tab_dyn;
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
            n_axis: e.detail.n_axis,
            show_subtitles: e.detail.show_subtitles,
            show_coltitle1: e.detail.show_coltitle1,
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
    _on_question_clone(e) {
        const old_id = this.params.title_table[this.i_tab].id;
        this.update_params({
            title_table: e.detail.table,
        });
        this.i_tab = this.params.title_table.findIndex((x) => x.id === old_id);
        this.sel_question_data();
        this._update_plot_data();
    }
    _on_show_hide_question(e) {
        this.update_params({
            title_table: e.detail.table,
        });
        const show_booleans = this.params.title_table.map((x) => x.show);
        if (!show_booleans[this.i_tab]) {
            // the current plot is hidden:
            this.i_tab = show_booleans.indexOf(true, this.i_tab);
            if (this.i_tab === -1) {
                // there is no ungidden plot until the end...
                // search from the start:
                this.i_tab = show_booleans.indexOf(true);
            }
        }
        this.sel_question_data();
        this._update_plot_data();
    }
    _on_text_edit(e) {
        this.params = produce(this.params, (draft) => {
            draft.title_table[e.detail.id].TabTitle = e.detail.text;
        });
        if (e.detail.id === this.i_tab) {
            this.update_choices({
                tab_title: e.detail.text,
            });
            this._update_plot_data();
        }
    }

    render() {
        inspect && console.log("rendering table-book-data");
        inspect && console.log(this);

        return this.choices === undefined
            ? html`<div></div>`
            : html`
                <div id="parent">
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
                    <div 
                        class="selector-group" 
                        id="question-selector" 
                        @clone-question=${this._on_question_clone}
                        @show-hide-question=${this._on_show_hide_question}
                        @edit-text=${this._on_text_edit}
                    >
                        <label>${translate("question.label")}</label>
                        <div class="content questions-div">
                            <question-selector 					
                                data-test-id="question-selector"	
                                @update-question="${this._on_question_update}" 		
                                .chosen_tab_no=${this.i_tab} 
                                .all_questions=${this.params.title_table}>
                            </question-selector>
                            <button 
                                id="show-hide-questions-table"
                                @click=${this.show_hide_questions_table}
                            >🔠</button>

                        </div>
                        <questions-table .questions_table_data=${this.params.title_table}  ?hidden=${!this.params.show_questions_table}></questions-table>
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
                    <button
                        id="show-hide"
                        data-test-id="show-hide-button"
                        @click="${this._on_expand}">
                        ${this.params.collapsed_view ? translate("showHide.show") : translate("showHide.hide")}
                    </button>
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
                                    .n_axis=${this.choices.n_axis}
                                    .show_subtitles=${this.choices.show_subtitles}
                                    .show_coltitle1=${this.choices.show_coltitle1}
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
                                <button id="reset-plots" @click="${this.init_plot_settings}">${translate("resetPlots.label")}</button>
                                <button id="save-app" @click="${save_file}">${translate("saveSettings.label")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    static styles = [
        css`
            option:checked {
                background: red linear-gradient(#333, #333);
            }
            label {
                background: #5e677b;
                color: white;
                display: block;
                border-top-right-radius: 4px;
                border-top-left-radius: 4px;
                padding: 5px;
                padding-left: 15px;
            }
            div.selector-group,
            #show-hide {
                border-style: solid;
                border-radius: 5px;
                border-width: 1px;
            }
            div.content {
                padding: 3px;
            }
            .hide {
                display: none;
            }
            .all-filtered {
                border: solid red;
            }
            button {
                width: 100%;
            }
            #reset-plots {
                margin-bottom: 5px;
            }
            hr {
                border: none;
                height: 1px;
                background-color: light-dark(black, white);
            }
            #parent {
                display: flex;
                flex-direction: column;
                margin-top: 5px;
                margin-bottom: 5px;
                gap: 5px;
            }
            .questions-div {
                display: flex;
                flex-direction: row;
            }
            #show-hide-questions-table {
                width: 2em;
            }
        `,
    ];
}

window.customElements.define("table-data-selector", TableDataSelector);
