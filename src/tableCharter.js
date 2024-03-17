import { LitElement, css, html } from "lit";
import "./ojs-plot.js";
import "./tableDataSelector.js";
import client_data from "./client_data.json";
import { registerTranslateConfig, use } from "lit-translate";

// approach from here: https://github.com/andreasbm/lit-translate/issues/29#issuecomment-863270983
import * as de_lang from "./languages/de.json";
import * as en_lang from "./languages/en.json";
registerTranslateConfig({
    loader: (lang) =>
        new Promise((resolve, reject) => {
            switch (lang) {
                case "de":
                    resolve(de_lang["default"]);
                    break;
                case "en":
                    resolve(en_lang["default"]);
            }
            reject(new Error(`The language ${lang} is not supported`));
        }),
});
export class TableCharter extends LitElement {
    static properties = {
        data: { type: Array },
        plot_data: { type: Array },
    };

    // needed for lit-translate to work properly from the beginning:
    // (see: https://github.com/andreasbm/lit-translate/blob/8f313900f4cea95aa8eca7e7409dcf8815d58df2/README.md#-wait-for-strings-to-be-loaded-before-displaying-the-component)
    constructor() {
        super();
        this._browser_language = navigator.language.replace(/-.*/, "") || "en";
        this.hasLoadedStrings = false;
    }
    shouldUpdate(changedProperties) {
        return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
    }
    async connectedCallback() {
        await use(this._browser_language);
        this.hasLoadedStrings = true;
        super.connectedCallback();
    }

    update_plot_data(e) {
        this.plot_data = e.detail.data;
    }
    update_lang() {
        const lang = this.renderRoot?.querySelector(
            "#lang-selector-select",
        ).value;
        use(lang);
    }

    // https://lit.dev/docs/composition/component-composition/#passing-data-up-and-down-the-tree
    // good example here:
    // https://stackoverflow.com/a/72402114
    render() {
        return html`
            <div class="content">
                <div class="column1">
                    <table-data-selector
                        .html_data=${this.data}
                        @update-data="${this.update_plot_data}"
                    ></table-data-selector>
                </div>
                <div class="column2">
                    <ojs-plot
                        class="ojsplot"
                        data-test-id="ojs-plot"
                        .plot_data=${this.plot_data}
                    >
                    </ojs-plot>
                </div>
            </div>
        `;
    }

    static styles = [
        css`
            .content {
                position: absolute;
                width: 100%;
                top: 60px;
                bottom: 30px;
                overflow: auto;
            }

            .column1 {
                float: left;
                width: 20%;
                padding: 20px;
                padding-top: 30px;
            }
            .column2 {
                float: left;
                width: 65%;
                padding: 30px;
                display: flex;
            }
        `,
    ];
}

window.customElements.define("table-charter", TableCharter);

const date = new Intl.DateTimeFormat("de", {
    year: "numeric",
    month: "short",
    day: "numeric",
}).format(new Date());
const logo =
    client_data.client_logo_base64 !== ""
        ? "data:image/png;base64, " + client_data.client_logo_base64
        : client_data.client_logo_url;

const languages_array = ["en", "de"];
