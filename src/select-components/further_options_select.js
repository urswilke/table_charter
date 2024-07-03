import { LitElement, html, css } from "lit";

import { translate } from "lit-translate";

export class FurtherOptionsSelect extends LitElement {
    static properties = {
        xy: { type: String },
        plot_type: { type: String },
    };

    _update_xy() {
        this.xy = this.xy === "x" ? "y" : "x";

        const options = {
            detail: {
                xy: this.xy,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-xy", options));
    }
    _update_plot_type() {
        this.plot_type = this.plot_type === "bar" ? "line" : "bar";

        const options = {
            detail: {
                plot_type: this.plot_type,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-plot_type", options));
    }

    render() {
        return html`
            <div class="parent grid">
                <div>${translate("flipXY.label1")}</div>
                <button
                    @click=${this._update_xy}
                    id="flip-xy-button"
                    data-test-id="flip-xy-button"
                >
                    ${this.xy}${translate("flipXY.label2")}
                </button>

                <div>${translate("plotName.label")}</div>
                <button
                    @click=${this._update_plot_type}
                    id="plot-type-button"
                    data-test-id="plot-type-button"
                >
                    ${translate("plotName." + this.plot_type)}
                </button>
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
            button {
                min-width: 0;
                overflow: hidden;
            }
        `,
    ];
}
customElements.define("further-options-select", FurtherOptionsSelect);
