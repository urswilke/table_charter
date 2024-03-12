import { LitElement, css, html, unsafeCSS } from 'lit'
import { when } from 'lit/directives/when.js';
import { translate, get } from "lit-translate";

import { PlotOptions } from './gen_plot_types.js'
import * as Plot from "@observablehq/plot";
import { select } from "d3";

import sharedStyles from './components.css?inline';

const inspect = false // set to true for some console.log msgs

export class OJSPlot extends LitElement {

	static properties = {
		plot_data: {type: Array},
		id: { type: String },
		chartTitle: { type: String },
		plot_options: { type: PlotOptions },
		file_name: { type: String },
	};

	set plot_data(val) {
		if (!val || val.length === 0) {
			return this
		}
		this.plot_options = new PlotOptions(val)
		const font_size = this.plot_options.o.font_size;
		this.style.setProperty('--font-size', String(font_size) + "px")
		this.style.setProperty('--big-font-size', String(1.5 * font_size) + "px")

		this.chartTitle = !!val.plot_data && val.plot_data.length > 0 ? val.plot_data[0].TabTitle : null
		const chartHeaders = !!val.plot_data && val.plot_data.length > 0 ? 
			get("plotTitle.subtitle_beginning") + " " + [...new Set(val.plot_data.map(x => x.ColTitle1))].join(" / ") :
			null
		const chartCaption = !!val.plot_data && val.plot_data.length > 0 ? val.plot_data[0].TabCaption : null
		this.chartSubTitle = [chartHeaders, chartCaption]
			// remove empty:
			.filter(n => n)
			.join(" - ")
	}


	render() {

		inspect && console.log("render")

		const options = this.plot_options?.options;
		this.renderedPlot = options && Plot.plot(options)
		// https://talk.observablehq.com/t/legend-placement-options/8407/3
		// adding this before will move the legend a bit downwards :)
		select(this.renderedPlot)
			.append("br")
		select(this.renderedPlot)
			.select(".large-font-ramp, .large-font-swatches")
			.raise()
			
		return when(
            options === undefined,
            () => html`<div class="all-filtered">
				<h1>${translate("noData.title")}</h1>
				<h3>${translate("noData.subTitle")}</h3>
			</div>`,
			// it's important to put the chart title text directly next to the ">" because of the pre-wrap style:
            () => html`
				<div>
					<div id="ojs-plot-div">
						<div style="margin-left: 80px">
							<h2 
								class="primary multi-line-header"
								data-test-id="plot-header"
							>${this.chartTitle}</h2>
							<h4>${this.chartSubTitle}</h4>
						</div>
						<div class="plot-div">${this.renderedPlot}</div>
					</div>
					<!-- <div class="save-svg-button">
						<button
							data-test-id="save-svg-button"
							@click="${this._click_save_svg}">
							${translate("saveSvg.label")}
						</button>
					</div> -->
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
		this.renderRoot.querySelector("[class*=large-font-]").style.fontSize = this.plot_options.o.font_size + "px"
		
		let tab_title_processed = this.plot_options.plot_data[0].TabTitle.replace(/[\./\\?%*:|"<> ]/g, '_')
		let i_tab = this.plot_options.plot_data[0].i_tab
		let svg_blob = create_svg_blob(this._svg)
		// let file_name = i_tab + "__" + tab_title_processed + '.svg'
		this.file_name = i_tab + "_" + '.svg'
		dowload_image(svg_blob, this.file_name)
	}
	static styles = [
		unsafeCSS(sharedStyles),
		css`
			.multi-line-header {
				white-space: pre-wrap;
			}
			.large-font-swatches, .large-font-ramp {
				font-size: var(--font-size);
				/* https://stackoverflow.com/questions/4767971/how-do-i-center-floated-elements/4767993#4767993: */
				display: inline-block;
			}
			.plot-div, .save-svg-button {
				text-align: center;
			}
			#no-data {
				border: 0.05em solid red;
				padding: 10px;
			}
			h2 {
				font-size: var(--big-font-size);
			}
			h4 {
				font-size: var(--font-size);
				margin-left: 40px;
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
	// apparently, this isn't needed when embedding svg in inline html
	// (see here: https://stackoverflow.com/questions/33025085/base64-svg-fails-to-render-in-chrome-works-in-firefox/33029193#33029193)
    // svgEl.setAttributeNS(xmlns, "xmlns", svgns);
	// TODO: find a way that also allows to show the svg outside of the browser 
	// (works in chrome/firefox, but not in image viewer)...!
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
