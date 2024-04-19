import { LitElement, css, html } from "lit";
import "./ojs-plot.js";
import "./tableDataSelector.js";
import { registerTranslateConfig, use } from "lit-translate";

// approach from here: https://github.com/andreasbm/lit-translate/issues/29#issuecomment-863270983
import { langs } from "./languages/languages.js";

registerTranslateConfig({
    loader: (lang) =>
        new Promise((resolve) => {
            resolve(langs[lang]);
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
        this.language = this.language || navigator.language.substring(0, 2);
        this.hasLoadedStrings = false;
        // HACK to regenerate plot on window resize...:
        window.addEventListener(
            "resize",
            (x) => (this.plot_data = { ...this.plot_data }),
        );
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
        if (!Object.keys(langs).includes(val)) {
            val = "en";
        }
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
        this.el("table-data-selector").style.visibility = "hidden";
        this.el(".column1").style.flexBasis = "1%";
        this.el(".column1").style.minWidth = "0";
        this.el(".column1").style.overflowY = "hidden";
        this.el(".column2").style.flexBasis = "75%";
    }
    show_menu() {
        this.el(".hide-menu").innerText = "×";
        this.el("table-data-selector").style.visibility = "visible";
        this.el(".column1").style.overflowY = "auto";
        this.el(".column1").style.flexBasis = "25%";
        this.el(".column1").style.minWidth = "150px";
        this.el(".column2").style.flexBasis = "95%";
    }
    show_hide_menu() {
        this.el(".hide-menu").innerText === "☰"
            ? this.show_menu()
            : this.hide_menu();
        // HACK to trigger re-rendering of <ojs-plot> element:
        this.plot_data = { ...this.plot_data };
    }

    render() {
        this.plot_data &&
            (this.plot_data.params = {
                language: this.language,
                element_width: this.el(".ojsplot").offsetWidth,
                element_height: this.el(".column2").offsetHeight,
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

            @media (max-aspect-ratio: 1) {
                .content {
                    flex-direction: column;
                    align-items: center;
                }
            }

            /* Exact aspect ratio, put it at the bottom to avoid override*/
            @media (aspect-ratio: 1) {
                .content {
                    flex-direction: column;
                    align-items: center;
                }
            }

            .column1 {
                flex: 0 0 25%;
                overflow-y: auto;
                padding: 20px;
                /* TODO: add resizing! with something like:
                resize: horizontal; */
            }
            .column2 {
                flex: 2 1 75%;
                display: flex;
                flex-direction: column;
                overflow: auto;
                /* https://stackoverflow.com/questions/46417543/is-there-a-cross-axis-counterpart-to-the-flex-grow-property-or-flex-which/70934694#70934694 */
                align-self: stretch;
            }
            .column2,
            .column1,
            .hide-menu {
                margin: 5px;
                border-style: solid;
                border-radius: 8px;
                border-width: 2px;
            }
            .hide-menu {
                float: right;
                font-size: 1.2em;
                margin: 0px;
            }
        `,
    ];
}

window.customElements.define("table-charter", TableCharter);
