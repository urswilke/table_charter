import { LitElement, html, css } from "lit";

import { translate } from "lit-translate";

export class AdvancedOptionsSelector extends LitElement {
    static properties = {
        show_mean: { type: Boolean },
        separate_headers: { type: Boolean },
        font_size: { type: String },
        show_text: { type: String },
    };

    constructor() {
        super();
        this.show_text_options = ["always", "never", "ifGE5"];
    }

    is_checked(id_string) {
        return (
            this.renderRoot?.querySelector(id_string + ":checked")?.value ===
            "on"
        );
    }

    _toggle_checkboxes() {
        const options = {
            detail: {
                show_mean: this.is_checked("#show-mean"),
                separate_headers: this.is_checked("#separate-headers"),
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-checkboxes", options));
    }
    get _font_size() {
        return this.renderRoot?.querySelector("#font-size").value;
    }
    get _show_text() {
        return this.renderRoot?.querySelector("#show-text").value;
    }
    _on_font_size_change() {
        const options = {
            detail: {
                font_size: this._font_size,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-font-size", options));
    }
    _on_show_text_change() {
        this.show_text = this._show_text;
        const options = {
            detail: {
                show_text: this.show_text,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-show-text", options));
    }

    render() {
        return html`
        <div class="parent">
			<form>
				<div>
					<label for="show-mean">${translate("showMean.label")}</label>
					<input 
						type="checkbox"
						data-test-id="n-checkbox" 
						id="show-mean"
						.checked=${this.show_mean}
						@click=${this._toggle_checkboxes}
					></input>
				</div>
				<div>
					<label for="separate-headers">${translate("separateHeaders.label")}</label>
					<input 
						type="checkbox"
						data-test-id="separate-headers-checkbox" 
						id="separate-headers"
						.checked=${this.separate_headers}
						@click=${this._toggle_checkboxes}
					></input>
				</div>
				<div>

					<label for="font-size">${translate("fontSize.label")}</label>
					<input 
						id="font-size" 
						type="number"
						.value=${this.font_size}
						min="5"
						max="30"
						@change=${this._on_font_size_change}
					></input>
				</div>
                <div>
                    <label for="show-text">${translate("showText.label")}</label>
                    <select 
                        id="show-text" 
                        @change=${this._on_show_text_change}
                    >
                        ${this.show_text_options.map(
                            (col) => html`
                                <option
                                    .selected=${this.show_text === col}
                                    .value=${col}
                                >
                                    ${translate("showText." + col)}
                                </option>
                            `,
                        )}
                    </select>
                </div>
			</form>
        </div>
        `;
    }

    static styles = [
        css`
            input[type="number"] {
                width: 3em;
            }
            form {
                display: table;
                border-spacing: 7px;
            }
            form > div {
                display: table-row;
            }
            label {
                display: table-cell;
                text-align: right;
            }

            input[type="checkbox"] {
                vertical-align: bottom;
                margin-left: 0;
            }
        `,
    ];
}
customElements.define("advanced-options-selector", AdvancedOptionsSelector);
