import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles } from '../utils.js'

export class SubcolumnSelector extends LitElement {
    static properties = {
		arr_col_titles: { type: Array },
	};

	get _chosen_subheader() {
		return this.renderRoot?.querySelector('#subheader-selector') ?? null;
	}
    

    _update_subheader() {
		const selected_lgl = [...this._chosen_subheader.options]
			.map(option => option.selected)
		this.arr_col_titles = this.arr_col_titles.map((x, i) => 
			({...x, selected: selected_lgl[i]})
		)
			  
        const options = {
			detail: {
				arr_col_titles: this.arr_col_titles,
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
                ${this.arr_col_titles.map(
                    (x) => html`
                        <option .selected=${x.selected}>
							${x.ColTitle2 || x.ColTitle1}
						</option>
				`)}
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
