import { LitElement, css, html } from "lit";
import "./ojs-plot.js";
import "./tableDataSelector.js";
import { registerTranslateConfig, use } from "lit-translate";
import { prepare_data } from "./utils.js";

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
        language: { type: String },
        data: { type: Array },
        plot_data: { type: Array },
    };

    // needed for lit-translate to work properly from the beginning:
    // (see: https://github.com/andreasbm/lit-translate/blob/8f313900f4cea95aa8eca7e7409dcf8815d58df2/README.md#-wait-for-strings-to-be-loaded-before-displaying-the-component)
    constructor() {
        super();
        this.language = this.language || "en";
        this.hasLoadedStrings = false;
    }
    shouldUpdate(changedProperties) {
        return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
    }
    async connectedCallback() {
        await use(this.language);
        this.hasLoadedStrings = true;
        super.connectedCallback();
    }

    set language(val) {
        (async () => {
            await use(val);
        })();
        this._language = val;
    }
    get language() {
        return this._language;
    }

    set data(val) {
        this._data = prepare_data(val);
    }
    get data() {
        return this._data;
    }

    update_plot_data(e) {
        this.plot_data = e.detail.data;
    }

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
