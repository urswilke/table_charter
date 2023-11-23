import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class QuestionSelector extends LitElement {
    static properties = {
		all_questions: { type: Array },
		all_tab_nos: { type: Array },
		chosen_tab_no: { type: Number },
	};

	get _chosen_tab_no() {
		return this.renderRoot?.querySelector('#question-selector') ?? null;
	}

    _update_question() {
		this.chosen_tab_no = this._chosen_tab_no.value
         
        const options = {
            detail: {
                chosen_tab_no: Number(this.chosen_tab_no),
            },
            bubbles: true,
            composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-question', options));
    }

    render() {
        return html`
        <label>question</label>
        <div>
            <select id="question-selector" @change=${this._update_question} .value="${this.chosen_tab_no}">
                ${this.all_tab_nos.map(
                    (col) => html`
                        <option value="${col}">${this.all_questions[col]}</option>
                    `
                )}
            </select>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		css`
            select {
                max-width: 100%;
            }
        `
	];
}
customElements.define('question-selector', QuestionSelector);
