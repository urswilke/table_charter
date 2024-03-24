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

    el(selector) {
        return this.renderRoot.querySelector(selector);
    }

    hide_menu() {
        this.el(".hide-menu").innerText = "☰";
        this.el(".hide-menu").style.float = "left";
        this.el("table-data-selector").style.visibility = "hidden";
        this.el(".column1").style.flexBasis = "2%";
        this.el(".column1").style.minWidth = "0";
        this.el(".column1").style.overflow = "";
        this.el(".column2").style.flexBasis = "75%";
    }
    show_menu() {
        this.el(".hide-menu").innerText = "×";
        this.el(".hide-menu").style.float = "right";
        this.el("table-data-selector").style.visibility = "visible";
        this.el(".column1").style.flexBasis = "25%";
        this.el(".column1").style.minWidth = "150px";
        this.el(".column2").style.flexBasis = "95%";
    }
    show_hide_menu() {
        this.renderRoot?.querySelector(".hide-menu").innerText === "☰"
            ? this.show_menu()
            : this.hide_menu();
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
                          <button
                              class="hide-menu"
                              @click="${this.show_hide_menu}"
                          >
                              ×
                          </button>

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
                display: flex;
                height: 100vh;
            }

            .column1 {
                flex: 0 0 25%;
                overflow-y: auto;
                /* width: 25%; */
                /* min-width: 150px; */
                padding: 20px;
            }
            .column2 {
                flex: 2 1 75%;
                display: flex;
                flex-direction: column;
                /* min-width: 300px; */
                /* flex-basis: 100%;
                flex-shrink: 0; */
                overflow: auto;
            }
            .hide-menu {
                float: right;
                font-size: 1.2em;
            }
        `,
    ];
}

window.customElements.define("table-charter", TableCharter);
