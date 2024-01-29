import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles, distinct } from '../utils.js'

export class MultiSelector extends LitElement {
    static properties = {
		prop_table: { type: Array },
		// parent_string: { type: String },
		// parent_fun: { type: Function },
		// children_fun: { type: Function }
	};
    constructor() {
        super()
        // this.parent_string = "ColTitle1"
        this.parent_fun = (x) => x[this.parent_string]
        // this.children_fun = (x) => x.ColTitle2 || x.ColTitle1
    }

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
            parent_strings.includes(this.parent_fun(x)) 
            ? {...x, selected: true} 
            : {...x, selected: false}
        )
        
        this._send_update_event("parents")
    }
    _update_children() {
		const selected_lgl = [...this._chosen_children.options]
			.map(option => option.selected)
		this.prop_table = this.prop_table.map((x, i) => 
			({...x, selected: selected_lgl[i]})
		)
			  
		this._send_update_event("children")
    }

	_send_update_event(from) {
		const options = {
			detail: {
				prop_table: this.prop_table,
				from: from
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-multi-select', options));
	}

    render() {
		const arr = distinct(this.prop_table, [this.parent_string, "selected"]);
		const obj = Object.groupBy(arr, this.parent_fun);
		const arr_selected = Object.keys( obj )
			.map(i => ({
                // https://stackoverflow.com/a/40699412
				[this.parent_string]: i, 
				selected: obj[i].length === 1 && obj[i][0].selected
			}));
        return html`
        <div class= "subselect">
			<label for="mainsel">${this.mainsel_text}</label>
            <select id="parents-selector" class="mainsel" multiple @change=${this._update_parents}>
                ${arr_selected.map((x) => html`
					<option .selected=${x.selected}>
						${this.parent_fun(x)}
					</option>
				`)}
            </select>
		</div>
		<div class= "subselect">
			<label for="subsel">${this.subsel_text}</label>
            <select id="children-selector" class="subsel" multiple @change=${this._update_children}>
                ${this.prop_table.map((x) => html`
                    <option .selected=${x.selected}>
                        ${this.children_fun(x)}
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
			div.subselect {
				display:inline-block;
			}
			label {
				display:flex;
				flex-direction:column;
			}
		`
	];
}
customElements.define('multi-selector', MultiSelector);