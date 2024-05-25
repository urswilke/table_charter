import { LitElement, html, css, unsafeCSS } from "lit";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import style from "tabulator-tables/dist/css/tabulator.min.css";

export class QuestionsTable extends LitElement {
    static properties = {
        questions_table_data: { type: Array },
    };
    firstUpdated() {
        this.gen_table();
    }
    gen_table() {
        var table_data = this.questions_table_data.map((x, i) => ({
            ...x,
            id: x.i_tab,
            clone: "♲",
        }));
        function duplicate_row(e, cell) {
            const row = cell.getRow();
            var i = table.getRowPosition(row) - 1;
            const data = table.getData().map((x) => ({
                ...x,
                id_index: Number(String(x.id).split("_")[1] || "0"),
            }));
            // array of indices of all questions with this i_tab:
            const all_indices = data
                .filter((x) => x.i_tab === data[i].i_tab)
                .map((x) => x.id_index);
            const new_subindex = Math.max(...all_indices) + 1;
            let this_row = cell.getData();
            this_row = { ...this_row, id: this_row.i_tab + "_" + new_subindex };
            // https://github.com/olifolkerd/tabulator/issues/4034#issuecomment-1326211853
            table.addData([this_row], false, row.getData().id);
        }

        const table = new Tabulator(
            this.renderRoot?.querySelector("#questions-table"),
            {
                height: 130, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                data: table_data,
                // reactiveData: true, //turn on data reactivity
                layout: "fitColumns", //fit columns to width of table (optional)
                selectableRange: 1,
                history: true,
                selectableRangeColumns: true,
                headerSortClickElement: "icon",
                selectableRangeRows: true,
                clipboard: true,
                clipboardCopyRowRange: "range",
                clipboardPasteParser: "range",
                clipboardPasteAction: "range",
                clipboardCopyConfig: {
                    rowHeaders: false,
                    columnHeaders: false,
                },
                columns: [
                    //Define Table Columns
                    {
                        title: "i",
                        field: "i_tab",
                        width: 30,
                        hozAlign: "right",
                    },
                    {
                        title: "show",
                        field: "show",
                        width: 30,
                        editor: true,
                        hozAlign: "center",
                        formatter: "tickCross",
                    },
                    {
                        title: "Question",
                        field: "TabTitle",
                        editor: "textarea",
                        editorParams: {
                            shiftEnterSubmit: true,
                        },
                    },
                    {
                        title: "Clone",
                        field: "clone",
                        width: 20,
                        hozAlign: "center",
                        cellClick: duplicate_row,
                    },
                ],
            },
        );
        this.questions_table = table;
    }

    render() {
        return html` <div id="questions-table"></div> `;
    }

    static styles = [
        css`
            ${unsafeCSS(style)}
        `,
        css`
            #questions-table {
                border-radius: 5px;
            }
        `,
    ];
}
customElements.define("questions-table", QuestionsTable);
