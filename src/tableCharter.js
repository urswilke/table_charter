import { LitElement, css, html, unsafeCSS } from 'lit'
import './ojs-plot.js'
import './tableDataSelector.js'
import client_data from './client_data.json';
import { registerTranslateConfig, use } from "lit-translate";
registerTranslateConfig({
  loader: lang => fetch(`./src/languages/${lang}.json`).then(res => res.json())
});
export class TableCharter extends LitElement {

	static properties = {
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
    async connectedCallback () {
        await use(this._browser_language);
        this.hasLoadedStrings = true;
        super.connectedCallback();
    }



    update_plot_data(e) {
        this.plot_data = e.detail.data;
    }
    update_lang()  {
        const lang = this.renderRoot?.querySelector("#lang-selector-select").value
        use(lang)
    }

    // https://lit.dev/docs/composition/component-composition/#passing-data-up-and-down-the-tree
    // good example here:
    // https://stackoverflow.com/a/72402114
	render() {
		return html`
            <div class="header">
            <img src=${logo} alt=${client_data.client_name} />
            <div id="lang_selector">
                <span>🌍</span>
                <select
                    id="lang-selector-select"
                    @change=${this.update_lang}
                >
                    ${languages_array.map((lang) => html`
                        <option .selected=${this._browser_language === lang}>
                            ${lang}
                        </option>
                    `)}
                </select>
            </div>
            <div>
                <p>${client_data.project_name + " - " + date}</p>
            </div>
            </div>

            <div class="content">
            <div class="column1">
                <table-data-selector @update-data="${this.update_plot_data}"></table-data-selector>
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
            <div class="footer">
                © 2023 - 2024 DATA-Connection Gebr. Wilke GbR
            </div>
		`;
	}

    static styles = [
        css`
            .header {
				position:absolute;
                top: 0;
    			left: 0; 
				right: 0;
                text-align: center;
                vertical-align: middle;
                background: #5e677b;
                color: white;
                padding: 5px;
                font-size: 20px;
				height: 60px;
                z-index: 2;
            }
            img {
                float: left;
                height: 60px;
            }
            #lang_selector {
                float: right;
            }
            .footer {
                height:20px;
                width:100%;

                margin: 0;
                position:absolute;
                bottom:0;
                padding: 10px;
                /* vertical-align: middle; */
                text-align: center;
                background: #2d3036;
                color: white;
            }
            .content {
                position:absolute;
                width:100%;
                top:60px;
                bottom:30px;
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
            
        `

    ]
}

window.customElements.define('table-charter', TableCharter)

const date = new Intl.DateTimeFormat('de', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
}).format((new Date()))
const logo = client_data.client_logo_base64 !== "" ?
    "data:image/png;base64, " + client_data.client_logo_base64 : 
    client_data.client_logo_url 

const languages_array = ["en", "de"]