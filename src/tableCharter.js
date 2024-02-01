import { LitElement, css, html, unsafeCSS } from 'lit'
import './ojs-plot.js'
import './tableDataSelector.js'
import client_data from './client_data.json' assert {type: 'json'};

export class TableCharter extends LitElement {

	static properties = {
        plot_data: { type: Array },
    };

	constructor() {
		super()
        this.plot_data = [];
	}

    update_plot_data(e) {
        this.plot_data = e.detail.data;
    }

    // https://lit.dev/docs/composition/component-composition/#passing-data-up-and-down-the-tree
    // good example here:
    // https://stackoverflow.com/a/72402114
	render() {
		return html`
            <div class="header">
            <img src="header_logo.png" alt="logo" />
            <div>
                <p>${client_data.project_name + " - " + date}</p>
            </div>
            </div>

            <div class="content">
            <div class="column1">
                <table-data-selector @update-data="${this.update_plot_data}"></table-data-selector>
            </div>
            <div class="column2">
                <ojs-plot class="ojsplot" .plot_data=${this.plot_data}></ojs-plot>
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
            }
            img {
                float: right;
                height: 60px;
            }
            .footer {
                height:20px;
                width:100%;

                margin: 0;
                position:absolute;
                bottom:0;
                padding-top: 2px;
                /* vertical-align: middle; */
                text-align: center;
                background: #2d3036;
                color: white;
            }
            .content {
                position:absolute;
                width:100%;
                top:60px;
                bottom:40px;
                overflow-y:auto;
            }


            .column1 {
                float: left;
                width: 20%;
                padding: 10px;
                overflow-x:auto;
            }
            .column2 {
                float: left;
                width: 65%;
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .ojsplot {
                vertical-align: middle;
                text-align: center;
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