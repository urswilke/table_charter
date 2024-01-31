import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class QuestionSelector extends LitElement {
    static properties = {
		all_questions: { type: Array },
		chosen_tab_no: { type: String },
	};

	get _chosen_tab_no() {
		return this.renderRoot?.querySelector('#question-selector') ?? null;
	}

    _update_question() {
		this.chosen_tab_no = this._chosen_tab_no.value
         
        const options = {
            detail: {
                chosen_tab_no: this.chosen_tab_no,
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
                ${this.all_questions.map(
                    (x) => html`
                        <option value="${x.i_tab}">${x.TabTitle}</option>
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
