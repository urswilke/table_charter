import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class HideRowsSelector extends LitElement {
    static properties = {
		all_row_types: { type: Array },
		chosen_row_types: { type: Array },
	};

	get _chosen_row_types() {
		return this.renderRoot?.querySelector('#row_types-selector') ?? null;
	}
    

    _update_row_types() {
		this.chosen_row_types = [...this._chosen_row_types.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_row_types: this.chosen_row_types,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-row_types', options));
    }

    render() {
        return html`
        <div>
            <select id="row_types-selector" multiple @change=${this._update_row_types}>
                ${this.all_row_types.map(
                    (col) => html`
                        <option 
                            .selected=${this.chosen_row_types.includes(col)}
                            value="${col}"
                        >${col}</option>
                    `
                )}
            </select>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		css`
		option:checked {
			background: red linear-gradient(#333,#333);
		}
	`
	];
}
customElements.define('row_types-selector', HideRowsSelector);
