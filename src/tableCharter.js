import { LitElement, css, html } from "lit";
import "./ojs-plot.js";
import "./tableDataSelector.js";
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
        language: { type: String },
        data: { type: Object },
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

    update_plot_data(e) {
        this.plot_data = e.detail.data;
    }

    render() {
        this.plot_data &&
            (this.plot_data.params = {
                element_width:
                    this.renderRoot?.querySelector(".column2").offsetWidth,
            });
        return this.data === undefined
            ? html`<div>no data loaded</div>`
            : html`
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
                /* top: 30px;
                bottom: 20px; */
                display: flex;
                /* flex-flow: column; */
                height: 100vh;
            }

            .column1 {
                flex: 1 1 auto;
                /* position: fixed; */
                overflow: auto;
                /* float: left; */
                width: 25%;
                padding: 20px;
            }
            .column2 {
                flex: 2 1 auto;
                display: flex;
                flex-direction: column;
                /* flex: 1; */
                overflow: auto;
                /* float: none; */
                /* margin-left: 25%; */
            }
        `,
    ];
}

window.customElements.define("table-charter", TableCharter);
