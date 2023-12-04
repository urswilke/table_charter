import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles, distinct } from '../utils.js'

export class MultiSelector extends LitElement {
    static properties = {
		prop_table: { type: Array },
	};

	get _chosen_parents() {
		return this.renderRoot?.querySelector('#parents-selector') ?? null;
	}
	get _chosen_children() {
		return this.renderRoot?.querySelector('#children-selector') ?? null;
	}
    

    _update_parents() {
		const parent_strings = [...this._chosen_parents.options]
			.filter(option => option.selected)
			.map(option => option.value)
		this.prop_table = this.prop_table.map(x => 
            parent_strings.includes(x.ColTitle1) 
            ? {...x, selected: true} 
            : {...x, selected: false}
        )
        
        this._send_update_event()
    }
    _update_children() {
		const selected_lgl = [...this._chosen_children.options]
			.map(option => option.selected)
		this.prop_table = this.prop_table.map((x, i) => 
			({...x, selected: selected_lgl[i]})
		)
			  
		this._send_update_event()
    }

	_send_update_event() {
		const options = {
			detail: {
				prop_table: this.prop_table,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-parents', options));
	}

    render() {
		const arr = distinct(this.prop_table, ["ColTitle1", "selected"]);
		const obj = Object.groupBy(arr, ({ ColTitle1 }) => ColTitle1);
		const arr_selected = Object.keys( obj )
			.map(i => ({
				ColTitle1: i, 
				selected: obj[i].length === 1 && obj[i][0].selected
			}));
        return html`
        <div>
            <select id="parents-selector" multiple @change=${this._update_parents}>
                ${arr_selected.map((x) => html`
					<option .selected=${x.selected}>
						${x.ColTitle1}
					</option>
				`)}
            </select>
        </div>
        <div>
            <select id="children-selector" multiple @change=${this._update_children}>
                ${this.prop_table.map((x) => html`
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
customElements.define('multi-selector', MultiSelector);
