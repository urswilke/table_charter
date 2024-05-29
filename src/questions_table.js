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
            // id: x.i_tab,
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
            const id = row.getData().id;
            // https://github.com/olifolkerd/tabulator/issues/4034#issuecomment-1326211853
            table.addData([this_row], false, id);
            var new_data = table
                .getData()
                .map((x, i) => ({ ...x, i_tab_dyn: i }));
            table.updateData(new_data);
            dispatch_event(cell, "clone-question", {
                table: new_data,
                id,
            });
        }
        function show_hide_question(e, cell) {
            cell.setValue(!cell.getValue());
            // avoid that all questions are hidden:
            if (
                cell
                    .getTable()
                    .getData()
                    .map((x) => x.show)
                    .every((x) => !x)
            ) {
                cell.setValue(true);
                return;
            }
            var new_data = table.getData();
            table.updateData(new_data);
            dispatch_event(cell, "show-hide-question", {
                table: new_data,
                id: cell.getData().id,
            });
        }

        function edit_text(cell) {
            dispatch_event(cell, "edit-text", {
                text: cell.getValue(),
                id: cell.getData().i_tab_dyn,
            });
        }
        function dispatch_event(cell, event_name, detail) {
            const options = {
                detail,
                bubbles: true,
                composed: true,
            };
            cell.getElement().dispatchEvent(
                new CustomEvent(event_name, options),
            );
        }

        const table_def = {
            height: 130, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            data: table_data,
            // reactiveData: true, //turn on data reactivity
            layout: "fitColumns", //fit columns to width of table (optional)
            // TODO: needs sth like a table.on("dataChanged"...) event to update plot correctly!
            history: true,
            headerSortClickElement: "icon",
            columns: [
                //Define Table Columns
                {
                    title: "i",
                    field: "i_tab",
                    width: 30,
                    hozAlign: "right",
                },
                {
                    title: "👁️",
                    field: "show",
                    width: 30,
                    hozAlign: "center",
                    formatter: "tickCross",
                    cellClick: show_hide_question,
                    cellTap: show_hide_question,
                },
                {
                    title: "Question",
                    field: "TabTitle",
                    editor: "textarea",
                    editorParams: {
                        shiftEnterSubmit: true,
                    },
                    cellEdited: edit_text,
                },
                {
                    title: "Clone",
                    field: "clone",
                    width: 20,
                    hozAlign: "center",
                    cellClick: duplicate_row,
                    cellTap: duplicate_row,
                },
            ],
        };
        const table = new Tabulator(
            this.renderRoot?.querySelector("#questions-table"),
            table_def,
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
