import { LitElement, css, html } from "lit";
import { translate, get } from "lit-translate";
import { fantasy_string } from "./utils.js";

import { PlotOptions } from "./gen_plot_types.js";
import * as Plot from "@observablehq/plot";
import { select } from "d3";

const inspect = false; // set to true for some console.log msgs

export class OJSPlot extends LitElement {
    static properties = {
        plot_data: { type: Array },
        id: { type: String },
        chartTitle: { type: String },
        plot_options: { type: PlotOptions },
        file_name: { type: String },
    };

    set plot_data(val) {
        if (!val || val.length === 0) {
            return this;
        }
        this.plot_options = new PlotOptions(val);
        const font_size = this.plot_options.input.font_size;
        this.style.setProperty("--font-size", String(font_size) + "px");
        this.style.setProperty(
            "--big-font-size",
            String(1.5 * font_size) + "px",
        );

        this.chartTitle =
            !!val.plot_data && val.plot_data.length > 0
                ? val.plot_data[0].TabTitle
                : null;
        const chartHeaders =
            !!val.plot_data && val.plot_data.length > 0
                ? get("plotTitle.subtitle_beginning") +
                  " " +
                  [...new Set(val.plot_data.map((x) => x.ColTitle1))].join(
                      " / ",
                  )
                : null;
        const chartCaption =
            !!val.plot_data && val.plot_data.length > 0
                ? val.plot_data[0].TabCaption
                : null;
        this.chartSubTitle = [chartHeaders, chartCaption]
            // remove empty:
            .filter((n) => n)
            .join(" - ");

        const options = this.plot_options?.options;
        if (!options) {
            return;
        }
        // this.renderedPlot = Object.assign(Plot.plot(options), {
        //     style: `max-width: ${options.width}px;`,
        // });
        this.renderedPlot = Plot.plot(options);
        // delete this.renderedPlot.style.maxWidth;

        let len,
            margin1,
            margin2,
            margin1_string,
            margin2_string,
            grid_template_string,
            padding1_string,
            padding2_string,
            grid_end,
            len_string,
            flex_dir,
            write_labels,
            word_breaker,
            hyphenator,
            text_overflower,
            white_spacer,
            overflower;

        const x_order = this.plot_options.derived.x_order;
        const n_cats = x_order.length;
        const is_x = this.plot_options.derived.is_x;

        if (is_x) {
            len = options.width;
            len_string = "width";
            margin1 = options.marginLeft;
            margin2 = options.marginRight;
            margin1_string = "margin-left";
            margin2_string = "margin-right";
            grid_template_string = "grid-template-columns";
            padding1_string = "padding-left";
            padding2_string = "padding-right";
            grid_end = "grid-column-end";
            flex_dir = "column";
            write_labels = () => {
                write_col_title2();
                write_col_title1();
            };
        } else {
            len = options.height;
            len_string = "height";
            margin1 = options.marginBottom;
            margin2 = options.marginTop;
            margin1_string = "margin-bottom";
            margin2_string = "margin-top";
            grid_template_string = "grid-template-rows";
            padding1_string = "padding-bottom";
            padding2_string = "padding-top";
            grid_end = "grid-row-end";
            flex_dir = "row";
            write_labels = () => {
                write_col_title1();
                write_col_title2();
            };
        }
        this.style.setProperty("--flex-dir", flex_dir);

        switch (this.plot_options.input.axis_labels) {
            case "truncate":
                text_overflower = "ellipsis";
                white_spacer = "nowrap";
                overflower = "hidden";
                word_breaker = "break-word";
                hyphenator = "auto";
                break;
            case "whole":
                text_overflower = "not_needed";
                white_spacer = "normal";
                overflower = "visible";
                break;
            default:
                break;
        }
        word_breaker =
            is_x & (this.plot_options.input.axis_labels === "")
                ? "break-word"
                : "normal";
        hyphenator = is_x ? "auto" : "none";
        this.style.setProperty("--text-overflow-attr", text_overflower);
        this.style.setProperty("--white-space-attr", white_spacer);
        this.style.setProperty("--overflow-attr", overflower);
        this.style.setProperty("--break-words-attr", word_breaker);
        this.style.setProperty("--hyphens-attr", hyphenator);

        const inset = (len - margin1 - margin2) / (10 * n_cats + 1);

        var cat_labels_div = select(this.renderedPlot)
            .append("div")
            .classed("cat_labels_div", true);

        const header_table_gaps = this.plot_options.derived.header_table_gaps;
        const arr_col_title1 = Object.entries(
            Object.groupBy(
                header_table_gaps.filter((x) => x.selected),
                (x) => x.ColTitle1,
            ),
        );

        const cat_labels = cat_labels_div.selectAll("div");
        write_labels();

        // TODO: for line plots this approach for the inset is slightly incorrect
        const plot_width = len - margin1 - margin2 - 2 * inset + "px";
        const style = {
            [margin1_string]: margin1 + "px",
            [margin2_string]: margin2 + "px",
            display: "grid",
            [grid_template_string]: `repeat(${n_cats}, minmax(0, 1fr))`,
            [len_string]: plot_width,
            "grid-gap": inset + "px",
            [padding1_string]: inset + "px",
            [padding2_string]: inset + "px",
            "font-size": font_size + "px",
            ...(!is_x && {
                "padding-left": "5%",
                "grid-auto-flow": "column",
                "max-width":
                    this.plot_options.derived.x_chart_labels_width * 100 -
                    5 +
                    "%",
            }),
        };

        Object.entries(style).forEach(([prop, val]) =>
            cat_labels_div.style(prop, val),
        );

        if (!is_x) {
            select(this.renderedPlot).select('svg[class*="plot-"]').raise();
        }

        // https://talk.observablehq.com/t/legend-placement-options/8407/3
        this.legend = select(this.renderedPlot)
            .select(".large-font-ramp, .large-font-swatches")
            .remove();

        function write_col_title1() {
            cat_labels
                .data(arr_col_title1)
                .enter()
                .append("div")
                .classed("cat-label gap", (d) => d[0] === "undefined")
                .classed("cat-label", true)
                .style(grid_end, (d) => "span " + d[1].length)
                .text(function (d) {
                    return d[0].replace(RegExp("^undefined$"), "");
                });
        }
        function write_col_title2() {
            cat_labels
                .data(x_order)
                .enter()
                .append("div")
                .classed("cat-label gap", (d) => d.includes(fantasy_string))
                .classed("cat-label", true)
                .text(function (d) {
                    return d.replace(RegExp("^" + fantasy_string + ".*"), "");
                });
        }
    }
    // this could be an alternative way to get the positions of the plot area
    // updated() {
    //     console.log(this.renderRoot.querySelector('rect[aria-label="frame"]')?.getBBox());
    // }

    render() {
        inspect && console.log("render");

        // prettier-ignore
        return this.plot_options?.options === undefined
            ? html`
                <div class="all-filtered">
                    <h1>${translate("noData.title")}</h1>
                    <h3>${translate("noData.subTitle")}</h3>
                </div>
            `
            // it's important to put the chart title text directly next to the ">" because of the pre-wrap style:
            : html`
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
                        <div class="legend-container">
                            ${this.legend}
                        </div>
                    </div>
                    <div class="save-svg-button">
						<button
							data-test-id="save-svg-button"
							@click="${this._click_save_svg}">
							${translate("saveSvg.label")}
						</button>
					</div>
                </div>
            `;
    }
    get _svg() {
        return this.renderRoot?.querySelector("#ojs-plot-div") ?? null;
    }

    _click_save_svg() {
        // Hack to set the font size in the legend that got lost to 16px again
        // TODO: use setting from user here and in PlotOptions.post_process()!:
        this.renderRoot.querySelector("[class*=large-font-]").style.fontSize =
            this.plot_options.input.font_size + "px";

        let tab_title_processed =
            this.plot_options.plot_data[0].TabTitle.replace(
                /[\./\\?%*:|"<> ]/g,
                "_",
            );
        let i_tab = this.plot_options.plot_data[0].i_tab;
        let svg_blob = create_svg_blob(this._svg);
        // let file_name = i_tab + "__" + tab_title_processed + '.svg'
        this.file_name = i_tab + "_" + ".svg";
        dowload_image(svg_blob, this.file_name);
    }
    static styles = [
        css`
            .multi-line-header {
                white-space: pre-wrap;
            }
            .large-font-swatches,
            .large-font-ramp {
                font-size: var(--font-size);
            }
            .plot-div,
            .save-svg-button {
                text-align: center;
            }
            #no-data {
                border: 0.05em solid red;
                padding: 10px;
            }
            h2 {
                font-size: var(--big-font-size);
                margin-right: 100px;
            }
            h4 {
                font-size: var(--font-size);
                margin-left: 40px;
            }
            .all-filtered {
                border: solid red;
                padding: 15px;
                border-width: 2px;
                border-radius: 8px;
            }
            figure[class*="plot-"] {
                margin: 0px;
                display: flex;
                flex-direction: var(--flex-dir);
            }
            .cat-label {
                align-items: center;
                justify-content: center;
                -webkit-box-shadow: inset 0px 0px 0px 1px;
                -moz-box-shadow: inset 0px 0px 0px 1px;
                box-shadow: inset 0px 0px 0px 1px;
                padding: 2px;
                text-overflow: var(--text-overflow-attr);
                white-space: var(--white-space-attr);
                overflow: var(--overflow-attr);
                word-break: var(--break-words-attr);
                hyphens: var(--hyphens-attr);
                z-index: 2;
            }
            .cat-label:hover {
                white-space: normal;
                background-color: grey;
                overflow: visible;
            }
            .gap {
                visibility: hidden;
            }
            .legend-container {
                margin: 20px;
                display: flex;
                justify-content: center;
            }
            /* #ojs-plot-div {
                margin-right: 10%;
                margin-left: 10%;
            } */

            /* this would add an orange border on hover: */
            /* svg[class^=plot-] > g > circle:hover,
            svg[class^=plot-] > g > rect:hover {
                stroke: orange;
                stroke-width:  2px;
            } */
        `,
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
    const string = serializer
        .serializeToString(svgEl)
        .replace(/<\!--.*?-->/g, "");
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

window.customElements.define("ojs-plot", OJSPlot);
