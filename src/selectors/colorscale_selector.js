import { LitElement, html, css, unsafeCSS } from 'lit';
import sharedStyles from './../components.css?inline';

export class ColorscaleSelector extends LitElement {
    static properties = {
		all_colorschemes: { type: Array },
		chosen_colorscheme: { type: String },
		chosen_colorscale: { type: String },
		colorscale_disabled: { type: Boolean },
	};

	get _chosen_colorscale() {
		return this.renderRoot?.querySelector('#colorscale-selector') ?? null;
	}
	get _chosen_colorscheme() {
		return this.renderRoot?.querySelector('#colorscheme-selector') ?? null;
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
    _update_colorscheme() {
		this.chosen_colorscheme = this._chosen_colorscheme.value
         
        const options = {
            detail: {
                // chosen_colorscale: this.chosen_colorscale,
                chosen_colorscheme: this.chosen_colorscheme,
            },
            bubbles: true,
            composed: true,
		};
		this.dispatchEvent(new CustomEvent('update-colorscheme', options));
    }

    render() {
        return html`
        <div class= "subselect">
            <label for="colorscale-selector">colorscale</label>
            <select id="colorscale-selector" @change=${this._update_colorscale} ?disabled=${this.colorscale_disabled}>
                ${this.all_colorscales.map((col) => html`
                    <option .selected=${this.chosen_colorscale === col}>
                        ${col}
                    </option>
                `)}
            </select>
        </div>
        <div class= "subselect">
            <label for="colorscheme-selector">colorscheme</label>
            <select id="colorscheme-selector" @change=${this._update_colorscheme}>
                ${this.all_colorschemes.map((col) => html`
                    <option .selected=${this.chosen_colorscheme === col}>
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
			div.subselect {
				float: left;
				/* flex-direction: row; */
			}
			label {
				display: block;
			}
	`
	];
}
customElements.define('colorscale-selector', ColorscaleSelector);
