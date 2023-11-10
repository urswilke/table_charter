import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class XYSelector extends LitElement {
    static properties = {
		xy: { type: String },
	};

	get _chosen_xy() {
		return this.renderRoot?.querySelector('#xy-selector') ?? null;
	}
    

    _update_xy() {
		this.xy = this.xy === "x" ? "y" : "x"
         
        const options = {
			detail: {
				chosen_xy: this.xy,
			},
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-xy', options));
    }

    render() {
        return html`
        <div>
            <button @click=${this._update_xy} value="y">Flip x & y axis</button>
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
