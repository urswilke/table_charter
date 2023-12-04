import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles, distinct } from '../utils.js'

export class ColumnSelector extends LitElement {
    static properties = {
		header_table: { type: Array },
	};

	get _chosen_header() {
		return this.renderRoot?.querySelector('#header-selector') ?? null;
	}
	get _chosen_subheader() {
		return this.renderRoot?.querySelector('#subheader-selector') ?? null;
	}
    

    _update_header() {
		const headers = [...this._chosen_header.options]
			.filter(option => option.selected)
			.map(option => option.value)
		this.header_table = this.header_table.map(x => 
				headers.includes(x.ColTitle1) 
				? {...x, selected: true} 
				: {...x, selected: false}
			)
         
			this._send_update_event()
		}
    _update_subheader() {
		const selected_lgl = [...this._chosen_subheader.options]
			.map(option => option.selected)
		this.header_table = this.header_table.map((x, i) => 
			({...x, selected: selected_lgl[i]})
		)
			  
		this._send_update_event()
    }

	_send_update_event() {
		const options = {
			detail: {
				header_table: this.header_table,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-header', options));
	}

    render() {
		// generate array of objects containing:
		// * ColTitle1, & 
		// * selected: (all sub-headers of this header are selected)
		const arr = distinct(this.header_table, ["ColTitle1", "selected"]);
		const obj = Object.groupBy(arr, ({ ColTitle1 }) => ColTitle1);
		const arr_selected = Object.keys( obj )
			.map(i => ({
				ColTitle1: i, 
				selected: obj[i].length === 1 && obj[i][0].selected
			}));
        return html`
        <div>
            <select id="header-selector" multiple @change=${this._update_header}>
                ${arr_selected.map((x) => html`
					<option .selected=${x.selected}>
						${x.ColTitle1}
					</option>
				`)}
            </select>
        </div>
        <div>
            <select id="subheader-selector" multiple @change=${this._update_subheader}>
                ${this.header_table.map(
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
customElements.define('column-selector', ColumnSelector);
