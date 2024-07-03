import { LitElement, html, css } from "lit";

export class RowtypeSelect extends LitElement {
    static properties = {
        all_num_types: { type: Array },
        chosen_num_type: { type: Array },
    };

    get _chosen_num_type() {
        return this.renderRoot?.querySelector("#num_type-select") ?? null;
    }

    _update_num_type() {
        this.chosen_num_type = this._chosen_num_type.value;
        // this.all_num_types = [...this._chosen_num_type.options].filter(option => option.selected).map(option => option.value)

        const options = {
            detail: {
                chosen_num_type: this.chosen_num_type,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-num_type", options));
    }

    render() {
        return html`
            <div>
                <select
                    id="num_type-select"
                    @change=${this._update_num_type}
                    .value=${this.chosen_num_type}
                    data-test-id="num_type-select"
                >
                    ${this.all_num_types.map(
                        (col) => html` <option title=${col}>${col}</option> `,
                    )}
                </select>
            </div>
        `;
    }

    static styles = [
        css`
            select {
                width: 100%;
                text-align-last: center;
            }
        `,
    ];
}
customElements.define("num_type-select", RowtypeSelect);
