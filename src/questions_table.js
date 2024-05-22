import { LitElement, html, css, unsafeCSS } from "lit";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import style from "tabulator-tables/dist/css/tabulator.min.css";

export class QuestionsTable extends LitElement {
    static properties = {
        questions_table_data: { type: Array },
    };
    firstUpdated() {
        this.questions_table = new Tabulator(
            this.renderRoot?.querySelector("#questions-table"),
            {
                height: 130, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                data: this.questions_table_data,
                // layout: "fitColumns", //fit columns to width of table (optional)
                columns: [
                    //Define Table Columns
                    { title: "i", field: "i_tab" },
                    { title: "Question", field: "TabTitle" },
                ],
            },
        );
    }

    render() {
        return html` <div id="questions-table"></div> `;
    }

    static styles = [
        css`
            ${unsafeCSS(style)}
        `,
    ];
}
customElements.define("questions-table", QuestionsTable);
