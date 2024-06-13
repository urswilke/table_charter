import { LitElement, css, html } from "lit";
import "./ojs-plot.js";
import "./tableDataSelector.js";
import { registerTranslateConfig, use } from "lit-translate";
import { translate } from "lit-translate";

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
        is_minimized: { type: Boolean, reflect: true },
        show_advanced: { type: Boolean },
        language: { type: String },
        data: { type: Object },
        plot_data: { type: Array },
    };

    // needed for lit-translate to work properly from the beginning:
    // (see: https://github.com/andreasbm/lit-translate/blob/8f313900f4cea95aa8eca7e7409dcf8815d58df2/README.md#-wait-for-strings-to-be-loaded-before-displaying-the-component)
    constructor() {
        super();
        this.is_minimized = false;
        this.language = this.language || navigator.language.substring(0, 2);
        this.hasLoadedStrings = false;
        this.show_advanced = false;
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

    _on_update_plot_data(e) {
        this.plot_data = e.detail.data;
    }

    el(selector) {
        return this.renderRoot.querySelector(selector);
    }

    hide_menu() {
        this.el(".hide-menu").innerText = "☰";
        this.el(".column1").style.flexBasis = "4em";
    }
    show_menu() {
        this.el(".hide-menu").innerText = "×";
        this.el(".column1").style.flexBasis = "25%";
    }
    _on_show_hide_menu() {
        this.is_minimized ? this.show_menu() : this.hide_menu();
        this.is_minimized = !this.is_minimized;
        // HACK to trigger re-rendering of <ojs-plot> element:
        this.plot_data = { ...this.plot_data };
    }

    _on_toggle_advanced_menu() {
        this.show_advanced = !this.show_advanced;
    }

    render() {
        return this.data === undefined
            ? html`<div>no data loaded</div>`
            : html`
                  <div class="content">
                      <div class="column1">
                          <div id="top-navbar">
                              <button
                                  class="hide-menu"
                                  @click="${this._on_show_hide_menu}"
                              >
                                  ×
                              </button>
                              ${this.help_button?.()}
                              <button
                                  id="toggle-advanced-menu"
                                  data-test-id="toggle-advanced-menu-button"
                                  @click="${this._on_toggle_advanced_menu}"
                                  title=${!this.show_advanced
                                      ? translate("toggleAdvancedMenu.show")
                                      : translate("toggleAdvancedMenu.hide")}
                              >
                                  ${!this.show_advanced ? "🎛️" : "🧹"}
                              </button>
                          </div>

                          <div class="settings">
                              <table-data-selector
                                  .is_minimized=${this.is_minimized}
                                  .html_data=${this.data}
                                  .language=${this.language}
                                  @update-data="${this._on_update_plot_data}"
                                  .show_advanced=${this.show_advanced}
                                  .savedSettings=${this.dataset.savedSettings}
                              ></table-data-selector>
                          </div>
                      </div>
                      <div class="column2">
                          <ojs-plot
                              class="ojsplot"
                              data-test-id="ojs-plot"
                              .plot_data=${this.plot_data}
                              .language=${this.language}
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
                gap: 5px;
                margin-top: 5px;
                margin-bottom: 5px;
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

            .column2,
            .column1 {
                border-style: solid;
                border-radius: 5px;
                border-width: 1px;
            }
            .column1 {
                display: flex;
                flex-direction: column;
                flex: 0 1 25%;
                overflow-y: auto;
                align-self: stretch;
                /* TODO: add resizing! with something like:
                resize: horizontal; */
            }
            .column2 {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                overflow: auto;
                /* https://stackoverflow.com/questions/46417543/is-there-a-cross-axis-counterpart-to-the-flex-grow-property-or-flex-which/70934694#70934694 */
                align-self: stretch;
                scrollbar-gutter: stable;
                margin-left: 0;
            }
            ojs-plot {
                height: 100%;
                width: 100%;
            }
            #top-navbar {
                background: #5e677b;
                border-top-right-radius: 4px;
                border-top-left-radius: 4px;
                padding: 2px;
                padding-left: 5px;
                padding-right: 5px;
                border-bottom: 1px solid;
            }
            .settings {
                overflow-y: auto;
                padding-left: 5px;
                padding-right: 5px;
            }
            :host([is_minimized]) #toggle-advanced-menu {
                display: none;
            }
        `,
    ];
}

window.customElements.define("table-charter", TableCharter);
