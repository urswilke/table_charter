import { LitElement, html, css } from "lit";

import { translate } from "lit-translate";

export class AdvancedOptionsSelector extends LitElement {
    static properties = {
        n_axis: { type: Boolean },
        show_subtitles: { type: Boolean },
        show_coltitle1: { type: Boolean },
        show_mean: { type: Boolean },
        separate_headers: { type: Boolean },
        font_size: { type: String },
        show_text: { type: String },
        axis_labels: { type: String },
    };

    constructor() {
        super();
        this.show_text_options = ["always", "never", "ifGE5"];
        this.axis_labels_options = ["whole", "truncate"];
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
                n_axis: this.is_checked("#n-axis"),
                show_subtitles: this.is_checked("#show-subtitles"),
                show_coltitle1: this.is_checked("#show-coltitle1"),
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
    get _axis_labels() {
        return this.renderRoot?.querySelector("#axis-labels").value;
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
    _on_axis_labels_change() {
        this.axis_labels = this._axis_labels;
        const options = {
            detail: {
                axis_labels: this.axis_labels,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-axis-labels", options));
    }

    render() {
        return html`
			<div class="grid">
                <div>${translate("nAxis.label")}</div>
                <div>
					<input 
						type="checkbox"
						data-test-id="n-axis" 
						id="n-axis"
						.checked=${this.n_axis}
						@click=${this._toggle_checkboxes}
					></input>
                </div>
                <div>${translate("showSubtitles.label")}</div>
                <div>
					<input 
						type="checkbox"
						data-test-id="show-subtitles" 
						id="show-subtitles"
						.checked=${this.show_subtitles}
						@click=${this._toggle_checkboxes}
					></input>
                </div>

                <div>${translate("showColTitle1.label")}</div>
                <div>
					<input 
						type="checkbox"
						data-test-id="show-coltitle1" 
						id="show-coltitle1"
						.checked=${this.show_coltitle1}
						@click=${this._toggle_checkboxes}
					></input>
                </div>
                <div>${translate("showMean.label")}</div>
                <div>
					<input 
						type="checkbox"
						data-test-id="n-checkbox" 
						id="show-mean"
						.checked=${this.show_mean}
						@click=${this._toggle_checkboxes}
					></input>
                </div>
                <div>${translate("separateHeaders.label")}</div>
                <div>
					<input 
						type="checkbox"
						data-test-id="separate-headers-checkbox" 
						id="separate-headers"
						.checked=${this.separate_headers}
						@click=${this._toggle_checkboxes}
					></input>
                </div>
                <div>${translate("fontSize.label")}</div>
                <div>
                    <input 
						id="font-size" 
						type="number"
						.value=${this.font_size}
						min="5"
						max="30"
						@change=${this._on_font_size_change}
					></input>
                </div>
                <div>${translate("showText.label")}</div>
                <div>
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
                <div>${translate("axisLabels.label")}</div>
                <div>
                    <select 
                        id="axis-labels" 
                        @change=${this._on_axis_labels_change}
                    >
                        ${this.axis_labels_options.map(
                            (col) => html`
                                <option
                                    .selected=${this.axis_labels === col}
                                    .value=${col}
                                >
                                    ${translate("axisLabels." + col)}
                                </option>
                            `,
                        )}
                    </select>
                </div>
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
            div {
                min-width: 0;
                overflow: hidden;
            }
            input[type="number"] {
                border-radius: 4px;
                border: solid grey 1px;
                width: 3em;
            }
            select {
                text-align-last: center;
                width: 100%;
            }
        `,
    ];
}
customElements.define("advanced-options-selector", AdvancedOptionsSelector);
