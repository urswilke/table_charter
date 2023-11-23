import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles } from '../utils.js'

export class SubcolumnSelector extends LitElement {
    static properties = {
		all_subheaders: { type: Array },
		chosen_subheader: { type: Array },
	};

	get _chosen_subheader() {
		return this.renderRoot?.querySelector('#subheader-selector') ?? null;
	}
    

    _update_subheader() {
		this.chosen_subheader = [...this._chosen_subheader.options].filter(option => option.selected).map(option => option.value)
         
        const options = {
			detail: {
				chosen_subheader: this.chosen_subheader,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-subheader', options));
    }

    render() {
        return html`
        <div>
            <select id="subheader-selector" multiple @change=${this._update_subheader}>
                ${this.all_subheaders.map(
                    (col) => html`
                        <option 
                            .selected=${this.chosen_subheader.includes(col)}
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
		css`
			option:checked {
				background: red linear-gradient(#333,#333);
			}
		`
	];
}
customElements.define('subcolumn-selector', SubcolumnSelector);
