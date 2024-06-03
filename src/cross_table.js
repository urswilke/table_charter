import { LitElement, html, css, unsafeCSS } from "lit";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import style_dark from "tabulator-tables/dist/css/tabulator_midnight.min.css";
import style_light from "tabulator-tables/dist/css/tabulator.min.css";
import { get, translate } from "lit-translate";

export class CrossTable extends LitElement {
    static properties = {
        crosstabs: { type: Object },
        language: { type: String },
        // update_tab_table: { type: Boolean },
    };
    updated() {
        this.gen_table();
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
        // this.cross_table = table;
        // this._send_table_updated_event();
    }

    render() {
        return html`
            <div class="wrapper">
                <div id="questions-table-titlebar">
                    <button
                        id="close"
                        type="button"
                        .language=${this.language}
                        @click=${this._close_questions_table}
                    >
                        ×
                    </button>
                    ${translate("crosstabTable.title")}
                </div>

                <div id="cross-table"></div>
            </div>
        `;
    }
    // _close_cross_table() {
    //     this.dispatchEvent(
    //         new CustomEvent("close-cross-table", {
    //             detail: {},
    //             bubbles: true,
    //             composed: true,
    //         }),
    //     );
    // }
    // _send_table_updated_event() {
    //     const options = {
    //         bubbles: true,
    //         composed: true,
    //     };
    //     this.dispatchEvent(new CustomEvent("tab_table-updated", options));
    // }

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
            #cross-table {
                border-bottom-left-radius: 5px;
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
                overflow: scroll;
                resize: both;
                height: 300px;
                border: solid light-dark(black, white) 1px;
            }
            .wrapper {
                /* width: 25%; */
                /* position: fixed; */
                border-radius: 5px;
            }
            #cross-table-titlebar {
                padding: 3px;
                background-color: #5e677b;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                border: solid light-dark(black, white) 1px;
                color: white;
                width: fit-content;
            }
            /* .tabulator-row .tabulator-cell[tabulator-field="RowTitle1"] {
                border-right: none;
            }
            .tabulator .tabulator-header .tabulator-col[tabulator-field="RowTitle1"] {
                border-right: none;
            } */
        `,
    ];
}
customElements.define("cross-table", CrossTable);
