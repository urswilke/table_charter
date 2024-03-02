import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class FurtherOptionsSelector extends LitElement {
    static properties = {
		xy: { type: String },
		plot_type: { type: String },
		show_n: { type: Boolean },
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
	get _show_n() {
		return this.renderRoot?.querySelector('#show-n:checked')?.value === "on";
	}

    _toggle_show_n() {
		this.show_n = !this.show_n
        const options = {
			detail: {
				show_n: this._show_n,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-show-n', options));
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
			<input 
				type="checkbox"
				data-test-id="n-checkbox" 
				id="show-n"
				.checked=${this.show_n}
				@click=${this._toggle_show_n}
			>
			<label for="show-n">Show totals in charts</label><br>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		css`
		.parent  *  {
			margin: 3px;
		}
	`
	];
}
customElements.define('further-options-selector', FurtherOptionsSelector);
