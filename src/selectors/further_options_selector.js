import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class FurtherOptionsSelector extends LitElement {
    static properties = {
		xy: { type: String },
		plot_type: { type: String },
		show_n: { type: Boolean },
		separate_headers: { type: Boolean },
		font_size: { type: String },
	};

    _update_xy() {
		this.xy = this.xy === "x" ? "y" : "x"
         
        const options = {
			detail: {
				xy: this.xy,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-xy', options));
    }
	_update_plot_type() {
		this.plot_type = this.plot_type === "bar" ? "line" : "bar"
         
        const options = {
			detail: {
				plot_type: this.plot_type,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-plot_type', options));
    }
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
            <button 
				@click=${this._update_xy}
				data-test-id="flip-xy-button"
			>Flip x & y axis</button>
            
			<button 
				@click=${this._update_plot_type}
				data-test-id="plot-type-button"
			>${this.plot_type + " chart"}</button>
			<hr></hr>
			
			<form>
				<field>
					<label for="show-n">Show totals in charts</label>
					<input 
						type="checkbox"
						data-test-id="n-checkbox" 
						id="show-n"
						.checked=${this.show_n}
						@click=${this._toggle_checkboxes}
					></input>
				</field>
				<field>
					<label for="separate-headers">Spatially separate headers</label>
					<input 
						type="checkbox"
						data-test-id="separate-headers-checkbox" 
						id="separate-headers"
						.checked=${this.separate_headers}
						@click=${this._toggle_checkboxes}
					></input>
				</field>
				<field>

					<label for="font-size">Font size</label>
					<input 
						id="font-size" 
						type="number"
						.value=${this.font_size}
						min="5"
						max="30"
						@change=${this._on_font_size_change}
					></input>
				</field>
			</form>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		css`
		.parent  *  {
			margin: 3px;
		}
		input[type='number']{
			width: 3em;
		}
		field {
			line-height: 2em;
		}
		form {
			display: grid;
		}
		label {
			float: left;
		}

	`
	];
}
customElements.define('further-options-selector', FurtherOptionsSelector);
