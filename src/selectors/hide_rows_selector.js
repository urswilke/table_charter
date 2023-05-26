import { LitElement, html } from 'lit';

export class HideRowsSelector extends LitElement {
    static properties = {
		// all_hide_rows: { type: Array },
		chosen_hide_rows: { type: Array },
	};

	get _chosen_hide_rows() {
		return this.renderRoot?.querySelector('#hide_rows-selector') ?? null;
	}
    

    _update_hide_rows() {
		this.chosen_hide_rows = [...this._chosen_hide_rows.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_hide_rows: this.chosen_hide_rows,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-hide_rows', options));
    }

    render() {
        return html`
        <label>Select hide_rows:</label>
        <div>
            <select id="hide_rows-selector" multiple @change=${this._update_hide_rows}>
                ${this.all_hide_rows.map(
                    (col) => html`
                        <option 
                            ?selected=${this.chosen_hide_rows.includes(col)}
                            value="${col}"
                        >${col}</option>
                    `
                )}
            </select>
        </div>
        `;
    }
}
customElements.define('hide_rows-selector', HideRowsSelector);
