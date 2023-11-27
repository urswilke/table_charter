import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles, distinct } from '../utils.js'

export class ColumnSelector extends LitElement {
    static properties = {
		arr_col_titles: { type: Array },
	};

	get _chosen_header() {
		return this.renderRoot?.querySelector('#header-selector') ?? null;
	}
    

    _update_header() {
		const headers = [...this._chosen_header.options]
			.filter(option => option.selected)
			.map(option => option.value)
			this.arr_col_titles = this.arr_col_titles.map(x => 
				headers.includes(x.ColTitle1) 
				? {...x, selected: true} 
				: {...x, selected: false}
			)
         
        const options = {
			detail: {
				arr_col_titles: this.arr_col_titles,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-header', options));
    }

    render() {
        return html`
        <div>
            <select id="header-selector" multiple @change=${this._update_header}>
                ${distinct(this.arr_col_titles, ["ColTitle1", "selected"]).map((x) => html`
					<option .selected=${x.selected}>
						${x.ColTitle1}
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
customElements.define('column-selector', ColumnSelector);
