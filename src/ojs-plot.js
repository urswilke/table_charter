import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { PlotOptions } from './gen_plot_types.js'

import sharedStyles from './components.css?inline';
import * as Plot from "@observablehq/plot";
import { select } from "d3";

const inspect = false // set to true for some console.log msgs

export class OJSPlot extends LitElement {

	static properties = {
		plot_data: {type: Array},
		id: { type: String },
		appStyles: { type: String },
		chartTitle: { type: String },
		plot_options: { type: PlotOptions },
		file_name: { type: String },
	};

	constructor() {

		super()
		
		this.chart = null
		this.appStyles = ''

	}

	set plot_data(val) {
		if (val.length === 0) {
			return this
		}
		this.plot_options = new PlotOptions(val)
		this.chartTitle = !!val.plot_data && val.plot_data.length > 0 ? val.plot_data[0].TabTitle: ""
	}


	render() {

		inspect && console.log("render")

		const options = this.plot_options?.options;
		const renderedPlot = options && Plot.plot(options)
		// https://talk.observablehq.com/t/legend-placement-options/8407/3
		select(renderedPlot)
			.select(".large-font-ramp, .large-font-swatches")
			.raise() 
		return when(
            options === null,
            () => html`<div></div>`,
			// it's important to put the chart title text directly next to the ">" because of the pre-wrap style:
            () => html`
				<div>
					<div id="ojs-plot-div">
						<h2 
							class="primary multi-line-header"
							data-test-id="plot-header"	
						>${this.chartTitle}</h2>
						<div class="plot-div">${renderedPlot}</div>
					</div>
					<div class="save-svg-button">
						<button
							data-test-id="save-svg-button"
							@click="${this._click_save_svg}">
							save svg
						</button>
					</div>
				</div>
			`
        );

	}
	get _svg() {
		return this.renderRoot?.querySelector("#ojs-plot-div") ?? null;
	}

	_click_save_svg() {
		// Hack to set the font size in the legend that got lost to 16px again
		// TODO: use setting from user here and in PlotOptions.post_process()!:
		this.renderRoot.querySelector("[class*=large-font-]").style.fontSize = "16px"
		
		let tab_title_processed = this.plot_options.plot_data[0].TabTitle.replace(/[\./\\?%*:|"<> ]/g, '_')
		let i_tab = this.plot_options.plot_data[0].i_tab
		let svg_blob = create_svg_blob(this._svg)
		// let file_name = i_tab + "__" + tab_title_processed + '.svg'
		this.file_name = i_tab + "_" + '.svg'
		dowload_image(svg_blob, this.file_name)
	}
	static styles = [
		unsafeCSS(this.appStyles),
		unsafeCSS(sharedStyles),
		css`
			.multi-line-header {
				white-space: pre-wrap;
			}
			:host {
				display: flex;
				background-color: var(--light-plot-background, "white")
			}
			:host[dark] {
				background-color: var(--dark-plot-background, "#1c1c1e")
			}
			:host div {
				color: var(--light-plot-div-color, "white")
			}
			:host div[dark] {
				color: var(--dark-plot-div-color, "white")
			}
			:host svg {
				background: var(--light-plot-background)
			}
			:host[dark] svg {
				background: var(--dark-plot-background)
			}
			.large-font-swatches, .large-font-ramp {
				font-size: 16px;
				/* https://stackoverflow.com/questions/4767971/how-do-i-center-floated-elements/4767993#4767993: */
				display: inline-block;
			}
			.plot-div, .save-svg-button {
				text-align: center;
			}
		`
	];

}

// combination of 
// https://observablehq.com/@mbostock/saving-svg
// and
// https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an/46403589#46403589
function create_svg_blob(svgEl) {
	const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";

	// It seems that this isn't needed (I have no idea what it does anyway...):
    // svgEl = svgEl.cloneNode(true);
    // const fragment = window.location.href + "#";
    // const walker = document.createTreeWalker(svgEl, NodeFilter.SHOW_ELEMENT);
    // while (walker.nextNode()) {
    //     for (const attr of walker.currentNode.attributes) {
    //         if (attr.value.includes(fragment)) {
    //             attr.value = attr.value.replace(fragment, "#");
    //         }
    //     }
    // }
    svgEl.setAttributeNS(xmlns, "xmlns", svgns);
    svgEl.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer();
    const string = serializer.serializeToString(svgEl).replace(/<\!--.*?-->/g, "");
    return new Blob([string], { type: "image/svg+xml" });

}
function dowload_image(image_blob, file_name) {
    var svgUrl = URL.createObjectURL(image_blob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = file_name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

window.customElements.define('ojs-plot', OJSPlot)
