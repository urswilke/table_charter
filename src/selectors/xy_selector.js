import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class XYSelector extends LitElement {
    static properties = {
		xy: { type: String },
		plot_type: { type: String}
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

    render() {
        return html`
        <div>
            <button @click=${this._update_xy}>Flip x & y axis</button>
            <button @click=${this._update_plot_type}>${this.plot_type + " chart"}</button>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
		css`
		option:checked {
			background: red linear-gradient(#333,#333);
		}
	`
	];
}
customElements.define('xy-selector', XYSelector);
