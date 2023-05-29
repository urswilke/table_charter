import { LitElement, html } from 'lit';

export class ColumnSelector extends LitElement {
    static properties = {
		// all_headers: { type: Array },
		chosen_header: { type: Array },
	};

	get _chosen_header() {
		return this.renderRoot?.querySelector('#header-selector') ?? null;
	}
    

    _update_header() {
		this.chosen_header = [...this._chosen_header.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_header: this.chosen_header,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-header', options));
    }

    render() {
        return html`
        <label>Select header(s):</label>
        <div>
            <select id="header-selector" multiple @change=${this._update_header}>
                ${this.all_headers.map(
                    (col) => html`
                        <option 
                            ?selected=${this.chosen_header.includes(col)}
                            value="${col}"
                        >${col}</option>
                    `
                )}
            </select>
        </div>
        `;
    }
}
customElements.define('column-selector', ColumnSelector);
