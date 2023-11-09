import { LitElement, html } from 'lit';

export class RowtypeSelector extends LitElement {
    static properties = {
		all_num_types: { type: Array },
		chosen_num_type: { type: Array },
	};

	get _chosen_num_type() {
		return this.renderRoot?.querySelector('#num_type-selector') ?? null;
	}

    _update_num_type() {
		this.chosen_num_type = this._chosen_num_type.value
		// this.all_num_types = [...this._chosen_num_type.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_num_type: this.chosen_num_type,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-num_type', options));
    }

    render() {
        return  html`
            <label>Show counts or percentages?</label>
            <div>
                <select id="num_type-selector" @change=${this._update_num_type} .value=${this.chosen_num_type}>
                    ${this.all_num_types.map(
                        (col) => html`
                            <option .value="${col}" title=${col}>${col}</option>
                        `
                    )}
                </select>
            </div>
        `;
    }
}
customElements.define('num_type-selector', RowtypeSelector);
