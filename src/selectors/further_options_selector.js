import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';
import { translate } from "lit-translate";

export class FurtherOptionsSelector extends LitElement {
    static properties = {
		xy: { type: String },
		plot_type: { type: String },
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
        <div class="parent">
            <button 
				@click=${this._update_xy}
				data-test-id="flip-xy-button"
			>${translate("flipXY.label")}</button>
            
			<button 
				@click=${this._update_plot_type}
				data-test-id="plot-type-button"
			>${translate("plotName." + this.plot_type)}</button>
        </div>
        `;
    }

	static styles = [
		unsafeCSS(sharedStyles),
	];
}
customElements.define('further-options-selector', FurtherOptionsSelector);
