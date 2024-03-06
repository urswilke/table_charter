import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class AdvancedOptionsSelector extends LitElement {
    static properties = {
		show_n: { type: Boolean },
		separate_headers: { type: Boolean },
		font_size: { type: String },
	};

	is_checked(id_string) {
		return this.renderRoot?.querySelector(id_string + ':checked')?.value === "on";
	}

    _toggle_checkboxes() {
        const options = {
			detail: {
				show_n: this.is_checked("#show-n"),
				separate_headers: this.is_checked("#separate-headers"),
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-checkboxes', options));
    }
	get _font_size() {
		return this.renderRoot?.querySelector('#font-size').value;
	}
	_on_font_size_change() {
        const options = {
			detail: {
				font_size: this._font_size,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-font-size', options));
	}

    render() {
        return html`
        <div class="parent">
			<form>
				<div>
					<label for="show-n">Show totals in charts</label>
					<input 
						type="checkbox"
						data-test-id="n-checkbox" 
						id="show-n"
						.checked=${this.show_n}
						@click=${this._toggle_checkboxes}
					></input>
				</div>
				<div>
					<label for="separate-headers">Spatially separate headers</label>
					<input 
						type="checkbox"
						data-test-id="separate-headers-checkbox" 
						id="separate-headers"
						.checked=${this.separate_headers}
						@click=${this._toggle_checkboxes}
					></input>
				</div>
				<div>

					<label for="font-size">Font size</label>
					<input 
						id="font-size" 
						type="number"
						.value=${this.font_size}
						min="5"
						max="30"
						@change=${this._on_font_size_change}
					></input>
				</div>
			</form>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		css`
		input[type='number']{
			width: 3em;
		}
		form {
			display: table;
			border-spacing: 7px;
		}
		form>div {
			display: table-row;
		}
		label {
			display: table-cell;
			text-align: right;
		}

input[type=checkbox] {
  vertical-align: bottom;
  margin-left:0;
}
	`
	];
}
customElements.define('advanced-options-selector', AdvancedOptionsSelector);
