import { LitElement, html } from 'lit';

export class QuestionSelector extends LitElement {
    static properties = {
		// all_questions: { type: Array },
		chosen_question: { type: String },
	};

	get _chosen_question() {
		return this.renderRoot?.querySelector('#question-selector') ?? null;
	}
    

    _update_question() {
		this.chosen_question = this._chosen_question.value
         
        const options = {
			detail: {
				data: {
					chosen_question: this.chosen_question,
				}
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-question', options));
    }

    render() {
        return html`
        <label>Select question:</label>
        <div>
            <select id="question-selector" @change=${this._update_question} .value="${this.chosen_question}">
                ${this.all_questions.map(
                    (col) => html`
                        <option value="${col}" title=${col}>${col}</option>
                    `
                )}
            </select>
        </div>
        `;
    }
}
customElements.define('question-selector', QuestionSelector);
