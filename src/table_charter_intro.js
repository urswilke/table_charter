import { get_walkthrough_options } from "./walkthrough_options.js";
import { TableCharter } from "./tableCharter.js";
import { default as introJs } from "intro.js";
import { html } from "lit";
// only needed, that rollup also bundles this file:
import "./table-charter-intro.css";

export class TableCharterIntro extends TableCharter {
    constructor() {
        super();
        this.show_intro = true;
    }
    async updated() {
        this.show_intro && (await this.show_help());
    }

    async show_help() {
        // https://stackoverflow.com/questions/58035998/run-a-function-once-all-children-element-are-actually-updated/58125954#58125954
        const children = this.renderRoot.querySelectorAll("*");
        if (Array.from(children).length === 1) {
            return;
        }
        await Promise.all(Array.from(children).map((c) => c.updateComplete));

        introJs()
            .setOptions(get_walkthrough_options(this))
            .onexit(() => (this.show_intro = false))
            .start();
    }
    help_button() {
        return html`
            <button class="show-help" @click="${this.show_help}">?</button>
        `;
    }
}
window.customElements.define("table-charter-intro", TableCharterIntro);
