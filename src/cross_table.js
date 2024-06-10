import { LitElement, html, css, unsafeCSS } from "lit";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import style_dark from "tabulator-tables/dist/css/tabulator_midnight.min.css";
import style_light from "tabulator-tables/dist/css/tabulator.min.css";
import { group } from "d3";

export class CrossTable extends LitElement {
    static properties = {
        language: { type: String },
        plot_data: { type: Array },
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
        const row_table = this.row_table.filter((x) => x.selected);

        // code redundant with gen_plot_types
        // TODO: better move execution of gen_plot_types in this class ??
        const decimal_formatter = Intl.NumberFormat(this.language).format;

        const data_formatted = this.plot_data.map((x) => ({
            ...x,
            Value: decimal_formatter(
                x.Value.toFixed(this.plot_data[0].RowDecimals),
            ),
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

    render() {
        return html` <div id="cross-table"></div> `;
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
            #cross-table {
                border-radius: 5px;
                overflow: scroll;
                height: 300px;
            }
        `,
    ];
}
customElements.define("cross-table", CrossTable);
