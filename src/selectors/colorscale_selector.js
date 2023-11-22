import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class ColorscaleSelector extends LitElement {
    static properties = {
		// all_colorscales: { type: Array },
		chosen_colorscale: { type: String },
		colorscale_disabled: { type: Boolean },
	};

	get _chosen_colorscale() {
		return this.renderRoot?.querySelector('#colorscale-selector') ?? null;
	}

    _update_colorscale() {
		this.chosen_colorscale = this._chosen_colorscale.value
         
        const options = {
            detail: {
                chosen_colorscale: this.chosen_colorscale,
            },
            bubbles: true,
            composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-colorscale', options));
    }

    render() {
        return html`
        <label>Select colorscale:</label>
        <div>
            <select id="colorscale-selector" @change=${this._update_colorscale} ?disabled=${this.colorscale_disabled}>
                ${this.all_colorscales.map((col) => html`
                    <option .selected=${this.chosen_colorscale === col}>
                        ${col}
                    </option>
                `)}
            </select>
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
customElements.define('colorscale-selector', ColorscaleSelector);
