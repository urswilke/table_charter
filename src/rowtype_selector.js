import { LitElement, html } from 'lit';

export class RowtypeSelector extends LitElement {
    static properties = {
		all_rowtypes: { type: Array },
		chosen_rowtype: { type: Array },
	};

	get _chosen_rowtype() {
		return this.renderRoot?.querySelector('#rowtype-selector') ?? null;
	}
	get _all_rowtypes() {
		return this.renderRoot?.querySelector('#rowtype-selector') ?? null;
	}
    

    _update_rowtype() {
		this.chosen_rowtype = this._chosen_rowtype.value
		this.all_rowtypes = [...this._all_rowtypes.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_rowtype: this.chosen_rowtype,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-rowtype', options));
    }

    render() {
        return html`
        <label>Select rowtype:</label>
        <div>
            <select id="rowtype-selector" @change=${this._update_rowtype} .value="${this.chosen_rowtype}>
                ${this.all_rowtypes.map(
                    (col) => html`
                        <option value="${col}" title=${col}>${col}</option>
                    `
                )}
            </select>
        </div>
        `;
    }
}
customElements.define('rowtype-selector', RowtypeSelector);
