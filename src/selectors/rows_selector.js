import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles } from '../utils.js'

export class HideRowsSelector extends LitElement {
    static properties = {
		all_rows: { type: Array },
		chosen_rows: { type: Array },
	};

	get _chosen_rows() {
		return this.renderRoot?.querySelector('#rows-selector') ?? null;
	}
    

    _update_rows() {
		this.chosen_rows = [...this._chosen_rows.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_rows: this.chosen_rows,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-rows', options));
    }

    render() {
        return html`
        <div>
            <select id="rows-selector" multiple @change=${this._update_rows}>
                ${this.all_rows.map(
                    (col) => html`
                        <option 
                            .selected=${this.chosen_rows.includes(col)}
                        >${col}</option>
                    `
                )}
            </select>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		buttonStyles,
	];
}
customElements.define('rows-selector', HideRowsSelector);
