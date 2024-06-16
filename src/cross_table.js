import { LitElement, html, css, unsafeCSS } from "lit";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import style_dark from "tabulator-tables/dist/css/tabulator_midnight.min.css?inline";
import style_light from "tabulator-tables/dist/css/tabulator.min.css?inline";
import { group } from "d3";
import { distinct } from "./utils.js";
import { translate } from "lit-translate";

export class CrossTable extends LitElement {
    static properties = {
        language: { type: String },
        crosstab_type: { type: String },
        plot_data: { type: Array },
        header_data: { type: Array },
        row_table: { type: Array },
        header_table: { type: Array },
        is_collapsed: { type: Boolean },
    };
    updated() {
        if (this.is_collapsed) {
            return;
        }
        this.prepare_crosstab();
        this.gen_table();
    }
    prepare_crosstab() {
        const show_all = this.crosstab_type === "selectOptionAll";
        const row_table = show_all
            ? distinct(
                  this.header_data,
                  "RowNo",
                  "RowContent",
                  "RowTitle1",
                  "RowTitle2",
                  "RowTitle3",
              )
            : this.row_table.filter((x) => x.selected);
        // code redundant with gen_plot_types
        // TODO: better move execution of gen_plot_types in this class ??
        const decimal_formatter = Intl.NumberFormat(this.language).format;

        const input_data = show_all ? this.header_data : this.plot_data;
        const data_formatted = input_data.map((x) => ({
            ...x,
            Value: decimal_formatter(x.Value.toFixed(x.RowDecimals)),
        }));

        this.crosstabs = {};
        this.crosstabs.data = Array.from(
            group(data_formatted, (d) => d.RowNo),
            ([RowNo, group]) =>
                Object.fromEntries(
                    [["RowNo", RowNo]].concat(
                        group.map((d) => [d.ColNo, d.Value]),
                    ),
                ),
        )
            // don't write repeated row titles:
            .map((x, i) => ({
                RowTitle1:
                    row_table[i].RowTitle1 !== row_table[i - 1]?.RowTitle1
                        ? row_table[i].RowTitle1
                        : "",
                RowTitle2:
                    row_table[i].RowTitle2 === row_table[i].RowTitle1
                        ? ""
                        : row_table[i].RowTitle2,
                ...(show_all && { RowTitle3: row_table[i].RowTitle3 }),
                ...x,
            }));
        const chosen_headers = this.header_table
            .filter((x) => x.selected)
            .map(({ ColNo, ColTitle1, ColTitle2, HeadNo }) => ({
                HeadNo,
                ColNo,
                ColTitle1,
                ColTitle2,
            }));

        const grouped_headers = Object.groupBy(chosen_headers, (x) => x.HeadNo);
        this.crosstabs.columns = Object.entries(grouped_headers).map((x) => ({
            title: x[1][0].ColTitle1,
            headerHozAlign: "center",
            columns: x[1].map((x) => ({
                title: x.ColTitle2,
                field: String(x.ColNo),
                // This avoids an infinitely growing width of the table
                width: "5em",
                hozAlign: "center",
                headerHozAlign: "center",
            })),
        }));
        // TODO: add information to Col table whether column is total...

        if (["TOTAL", "GESAMT"].includes(this.crosstabs.columns[0].title)) {
            this.crosstabs.columns[0].frozen = true;
        }

        const all_labels = [
            ...new Set(this.crosstabs.data.map((x) => x.RowTitle2)),
        ];
        const all_rowtitle2_redundant =
            all_labels.length === 1 && all_labels[0] === "";
        let width1, width2;
        if (all_rowtitle2_redundant) {
            width1 = 160;
        } else {
            width1 = 80;
            width2 = 80;
        }

        show_all &&
            this.crosstabs.columns.unshift({
                title: "",
                field: "RowTitle3",
                frozen: true,
                width: 20,
            });
        !all_rowtitle2_redundant &&
            this.crosstabs.columns.unshift({
                title: "",
                field: "RowTitle2",
                frozen: true,
                width: width2,
            });
        this.crosstabs.columns.unshift({
            title: "",
            field: "RowTitle1",
            frozen: true,
            width: width1,
        });
    }

    gen_table() {
        var table_data = this.crosstabs.data.map((x, id) => ({ id, ...x }));

        const table_def = {
            data: table_data,
            layout: "fitColumns",
            history: true,
            headerSortClickElement: "icon",
            columns: this.crosstabs.columns,
        };
        const table = new Tabulator(
            this.renderRoot?.querySelector("#cross-table"),
            table_def,
        );
    }
    get _crosstab_type() {
        return this.renderRoot?.querySelector(".select-tab-type") ?? null;
    }

    _update_crosstab_type() {
        this.crosstab_type = this._crosstab_type.value;

        const options = {
            detail: {
                crosstab_type: this.crosstab_type,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-crosstab-type", options));
    }

    render() {
        const table_options = ["selectOptionAll", "selectOptionPlottedValues"];
        return html`
            <div class="select-crosstab-type">
                <a>${translate("crosstabTable.selectText")}: </a>
                <select
                    @change=${this._update_crosstab_type}
                    class="select-tab-type"
                >
                    ${table_options.map(
                        (x) => html`
                            <option
                                .value=${x}
                                .selected=${this.crosstab_type === x}
                            >
                                ${translate("crosstabTable." + x)}
                            </option>
                        `,
                    )}
                </select>
            </div>
            <div id="cross-table"></div>
        `;
    }

    static styles = [
        css`
            @media (prefers-color-scheme: light) {
                ${unsafeCSS(style_light)}
            }
            @media (prefers-color-scheme: dark) {
                ${unsafeCSS(style_dark)}
            }
        `,
        css`
            .select-crosstab-type {
                margin: 3px;
            }
            #cross-table {
                border-radius: 5px;
                overflow: scroll;
                height: 300px;
            }
        `,
    ];
}
customElements.define("cross-table", CrossTable);
