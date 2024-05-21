import { LitElement, html, css } from "lit";

import { translate } from "lit-translate";
import { all_color_schemes } from "../gen_plot_types.js";

export class ColorscaleSelector extends LitElement {
    static properties = {
        chosen_colorscheme: { type: String },
        chosen_colorscale: { type: String },
        colorscale_disabled: { type: Boolean },
    };

    get _chosen_colorscale() {
        return this.renderRoot?.querySelector("#colorscale-selector") ?? null;
    }
    get _chosen_colorscheme() {
        return this.renderRoot?.querySelector("#colorscheme-selector") ?? null;
    }

    _update_colorscale() {
        this.chosen_colorscale = this._chosen_colorscale.value;

        const options = {
            detail: {
                chosen_colorscale: this.chosen_colorscale,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-colorscale", options));
    }
    _update_colorscheme() {
        this.chosen_colorscheme = this._chosen_colorscheme.value;

        const options = {
            detail: {
                // chosen_colorscale: this.chosen_colorscale,
                chosen_colorscheme: this.chosen_colorscheme,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-colorscheme", options));
    }

    render() {
        const color_schemes = all_color_schemes[this.chosen_colorscale];
        return html`
            <div class="grid">
                <div>${translate("color.scale")}</div>
                <select
                    id="colorscale-selector"
                    @change=${this._update_colorscale}
                    ?disabled=${this.colorscale_disabled}
                >
                    ${this.all_colorscales.map(
                        (col) => html`
                            <option
                                .selected=${this.chosen_colorscale === col}
                                .value=${col}
                            >
                                ${translate("color." + col)}
                            </option>
                        `,
                    )}
                </select>
                <div>${translate("color.scheme")}</div>
                <select
                    id="colorscheme-selector"
                    @change=${this._update_colorscheme}
                >
                    ${color_schemes.map(
                        (col) => html`
                            <option
                                .selected=${this.chosen_colorscheme === col}
                            >
                                ${col}
                            </option>
                        `,
                    )}
                </select>
            </div>
        `;
    }

    static styles = [
        css`
            .grid {
                display: grid;
                grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
                grid-gap: 1.2em;
            }

            div.subselect {
                display: inline-block;
            }
            label {
                display: block;
                padding-left: 7px;
            }
            select {
                text-align-last: center;
            }
        `,
    ];
}
customElements.define("colorscale-selector", ColorscaleSelector);
