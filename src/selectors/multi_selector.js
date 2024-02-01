import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { buttonStyles, distinct } from '../utils.js'

export class MultiSelector extends LitElement {
    static properties = {
		prop_table: { type: Array },
		collapsed_view: { type: Boolean },
	};
    constructor() {
        super()
        this.parent_fun = (x) => x[this.parent_string]
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
		<div class="parent">
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
		<div class= ${"subselect" + (!this.collapsed_view ? "" : " hide")}>
			<label for="subsel">${this.subsel_text}</label>
            <select id="children-selector" class="subsel" multiple @change=${this._update_children}>
                ${this.prop_table.map((x) => html`
                    <option .selected=${x.selected}>
                        ${this.children_fun(x)}
                    </option>
				`)}
            </select>
        </div>
		</div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		buttonStyles,
		// TODO: use different color if only part of the parents are checked...!
		css`
			option:checked {
				background: red linear-gradient(#333,#333);
			}
			option {
				text-overflow:ellipsis;
			}
			select {
				width:100%; 
				/* overflow:hidden;  */
			    white-space:nowrap;
				text-overflow:ellipsis;
			}
			.subselect {
				display:inline-block;
			}
			.parent  *  {
				margin: 3px;
			}
			label {
				display:flex;
				flex-direction:column;
				padding-left: 7px;
			}
			.hide {
				display: none
			}
		`
	];
}
customElements.define('multi-selector', MultiSelector);