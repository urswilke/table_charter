import { LitElement, html, css } from "lit";

export class QuestionSelector extends LitElement {
    static properties = {
        all_questions: { type: Array },
        chosen_tab_no: { type: Number },
    };

    get _chosen_tab_no() {
        return this.renderRoot?.querySelector("#question-selector") ?? null;
    }

    _update_question() {
        this.chosen_tab_no = [...this._chosen_tab_no.options]
            .map((x) => x.selected)
            .indexOf(true);

        const options = {
            detail: {
                chosen_tab_no: this.chosen_tab_no,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-question", options));
    }

    render() {
        const initial_value = this.all_questions[this.chosen_tab_no].TabTitle;
        return html`
            <div class="parent">
                <select id="question-selector" @change=${this._update_question}>
                    ${this.all_questions.map(
                        (x) => html`
                            <option
                                .selected=${initial_value === x.TabTitle}
                                .disabled=${!x.show}
                            >
                                ${x.TabTitle}
                            </option>
                        `,
                    )}
                </select>
            </div>
        `;
    }

    static styles = [
        css`
            select {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `,
    ];
}
customElements.define("question-selector", QuestionSelector);
