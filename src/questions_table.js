import { LitElement, html, css, unsafeCSS } from "lit";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { get, translate } from "lit-translate";

export class QuestionsTable extends LitElement {
    static properties = {
        questions_table_data: { type: Array },
        is_collapsed: { type: Boolean },
    };
    updated() {
        !this.is_collapsed && this.questions_table_data && this.gen_table();
    }
    gen_table() {
        var table_data = this.questions_table_data.map((x) => ({
            ...x,
            clone: "♲",
        }));

        // HACK: somehow the localization only works here and not in the columns definition...:
        // it doesn't update on language change
        columns[2].title = get("questionsTable.questionColumn");
        columns[3].title = get("questionsTable.cloneColumn");

        const table_def = {
            data: table_data,
            layout: "fitColumns",
            // TODO: needs sth like a table.on("dataChanged"...) event to update plot correctly!
            history: true,
            headerSortClickElement: "icon",
            columns,
        };
        // without, I received this error when rebuilding the table: "Event Target Lookup Error - The row this cell is attached to cannot be found, has the table been reinitialized without being destroyed first?"
        this.questions_table && this.questions_table.destroy();
        const table = new Tabulator(
            this.renderRoot?.querySelector("#questions-table"),
            table_def,
        );
        this.questions_table = table;
        this._send_table_updated_event();
    }

    render() {
        // https://stackoverflow.com/questions/69613048/how-to-load-external-css-file-with-lit/75973380#75973380
        return html`
            <link
                rel="stylesheet"
                href="https://unpkg.com/tabulator-tables/dist/css/tabulator_midnight.min.css"
            />
            <div id="questions-table"></div>
        `;
    }
    _send_table_updated_event() {
        const options = {
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("tab_table-updated", options));
    }

    static styles = [
        css`
            #questions-table {
                overflow: scroll;
                height: 300px;
                border: solid light-dark(black, white) 1px;
            }
        `,
    ];
}
customElements.define("questions-table", QuestionsTable);

function duplicate_row(e, cell) {
    const table = cell.getTable();
    const row = cell.getRow();
    const data = table.getData();
    // array of indices of all questions with this i_tab:
    const all_indices = data
        .filter((x) => x.i_tab === row.getData().i_tab)
        .map((x) => x.i_i_tab);
    const new_subindex = Math.max(...all_indices) + 1;
    let new_row = { ...row.getData() };
    new_row.i_i_tab += 1;
    let old_id = new_row.id;
    const id = new_row.i_tab + "_" + new_subindex;
    new_row.id = id;
    // https://github.com/olifolkerd/tabulator/issues/4034#issuecomment-1326211853
    table.addData([new_row], false, old_id);
    var new_data = set_index(table.getData());
    table.updateData(new_data);
    dispatch_event(cell, "clone-question", {
        table: new_data,
        id,
    });
}
function set_index(array) {
    return array.map((x, i) => ({ ...x, i_tab_dyn: i }));
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
    const table = cell.getTable();
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
    cell.getElement().dispatchEvent(new CustomEvent(event_name, options));
}

const columns = [
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
    },
    {
        field: "TabTitle",
        editor: "textarea",
        editorParams: {
            shiftEnterSubmit: true,
        },
        cellEdited: edit_text,
    },
    {
        field: "clone",
        width: 20,
        hozAlign: "center",
        cellClick: duplicate_row,
    },
];
