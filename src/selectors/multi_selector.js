import { LitElement, html, css } from "lit";

import { distinct } from "../utils.js";

export class MultiSelector extends LitElement {
    static properties = {
        prop_table: { type: Array },
        collapsed_view: { type: Boolean },
        // These need to be reactive, to update on language change:
        mainsel_text: { type: String },
        subsel_text: { type: String },
    };
    constructor() {
        super();
        this.parent_fun = (x) => x[this.parent_string];
    }

    get _chosen_parents() {
        return this.renderRoot?.querySelector("#parents-selector") ?? null;
    }
    get _chosen_children() {
        return this.renderRoot?.querySelector("#children-selector") ?? null;
    }

    _update_parents() {
        const parent_strings = [...this._chosen_parents.options]
            .filter((option) => option.selected)
            .map((option) => option.value);
        this.prop_table = this.prop_table.map((x) =>
            parent_strings.includes(this.parent_fun(x))
                ? { ...x, selected: true }
                : { ...x, selected: false },
        );

        this._send_update_event("parents");
    }
    _update_children() {
        const selected_lgl = [...this._chosen_children.options].map(
            (option) => option.selected,
        );
        this.prop_table = this.prop_table.map((x, i) => ({
            ...x,
            selected: selected_lgl[i],
        }));

        this._send_update_event("children");
    }

    _send_update_event(from) {
        const options = {
            detail: {
                prop_table: this.prop_table,
                from: from,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("update-multi-select", options));
    }

    render() {
        const arr = distinct(this.prop_table, this.parent_string, "selected");
        const obj = Object.groupBy(arr, this.parent_fun);
        const arr_selected = Object.keys(obj).map((i) => ({
            // https://stackoverflow.com/a/40699412
            [this.parent_string]: i,
            selected: obj[i].length === 1 && obj[i][0].selected,
        }));
        return html`
            <div class="parent">
                <div class="subselect">
                    <select
                        id="parents-selector"
                        class="mainsel"
                        multiple
                        @change=${this._update_parents}
                    >
                        ${arr_selected.map(
                            (x) => html`
                                <option
                                    .selected=${x.selected}
                                    title=${this.parent_fun(x)}
                                >
                                    ${this.parent_fun(x)}
                                </option>
                            `,
                        )}
                    </select>
                </div>
                <div
                    class=${"subselect" + (!this.collapsed_view ? "" : " hide")}
                >
                    <select
                        id="children-selector"
                        class="subsel"
                        multiple
                        @change=${this._update_children}
                    >
                        ${this.prop_table.map(
                            (x) => html`
                                <option
                                    .selected=${x.selected}
                                    ${
                                        /* TODO: put children_fun in data preparation code */ ""
                                    }
                                    title=${this.children_fun(x)}
                                >
                                    ${this.children_fun(x)}
                                </option>
                            `,
                        )}
                    </select>
                </div>
            </div>
        `;
    }

    static styles = [
        // TODO: use different color if only part of the parents are checked...!
        css`
            div.parent {
                display: flex;
            }
            .subselect {
                flex: auto;
                /* both will have equal width: */
                flex-basis: 0;
            }
            select {
                width: 100%;
                border: solid grey 1px;
                border-radius: 5px;
            }
            option {
                text-overflow: ellipsis;
                margin: 1px;
                /* for firefox this would be needed to have the same margins 
                on top as left and right. on chrome not...: */
                /* margin-top: 0; */
                overflow: hidden;
                white-space: nowrap;
                border-radius: 4px;
            }
            .hide {
                display: none;
            }
            option:checked {
                background: grey linear-gradient(40deg, grey 0%, #bbb 100%);
            }
            option:hover {
                opacity: 0.8;
            }
        `,
    ];
}
customElements.define("multi-selector", MultiSelector);
