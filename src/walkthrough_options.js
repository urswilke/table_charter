import { get } from "lit-translate";

export function get_walkthrough_options(tc) {
    const sel = (el) => (x) => el.renderRoot.querySelector(x);

    const tc_el = sel(tc);
    const tds = tc_el("table-data-selector");
    const tds_el = sel(tds);
    const fos = tds_el("further-options-selector");
    const fos_el = sel(fos);
    const aos = tds_el("advanced-options-selector");
    const aos_el = sel(aos);
    const cos = tds_el("colorscale-selector");
    const cos_el = sel(cos);
    const default_elements = {
        dontShowAgain: true,
        dontShowAgainLabel: get("walktrough.control.dontShowAgainLabel"),
        // TODO: use a string with the BookNo or something...!:
        // dontShowAgainCookie: "hjklfdahlfdassdljkhs",
        nextLabel: get("walktrough.control.next"),
        prevLabel: get("walktrough.control.back"),
        doneLabel: get("walktrough.control.done"),
        steps: [
            {
                title: get("walktrough.welcome.title"),
                intro: get("walktrough.welcome.text"),
            },
            {
                title: get("walktrough.general.title"),
                intro: get("walktrough.general.text"),
            },
            {
                element: tds_el("#num-type-div"),
                title: get("numType.label"),
                intro: get("walktrough.numTypeDiv.text"),
            },
            {
                element: tds_el("#question-selector"),
                title: get("question.label"),
                intro: get("walktrough.question.text"),
            },
            {
                element: tds_el("#header-multi-sel"),
                title: get("header.label"),
                intro: get("walktrough.header.text"),
            },
            {
                element: tds_el("#row-multi-sel"),
                title: get("rows.label"),
                intro: get("walktrough.rows.text"),
            },
            {
                element: tds_el("#show-hide"),
                title: get("walktrough.showHide.title"),
                intro: get("walktrough.showHide.text"),
                hint: get("walktrough.showHide.hint"),
            },
            {
                element: tc_el(".show-help"),
                title: get("walktrough.showHelp.title"),
                intro: get("walktrough.showHelp.text"),
                hint: get("walktrough.showHelp.hint"),
            },
            {
                element: tc_el(".hide-menu"),
                title: get("walktrough.hideMenu.title"),
                intro: get("walktrough.hideMenu.text"),
                hint: get("walktrough.hideMenu.hint"),
            },
        ],
    };
    if (tds.params.collapsed_view) {
        return default_elements;
    }
    const advanced_elements = {
        steps: [
            {
                element: tds_el("#header-multi-sel"),
                title: get("header.label"),
                intro: get("walktrough.header.advancedText"),
            },
            {
                element: tds_el("#row-multi-sel"),
                title: get("rows.label"),
                intro: get("walktrough.rows.advancedText"),
            },
            {
                element: fos_el("#flip-xy-button"),
                title: get("walktrough.flipXY.title"),
                intro: get("walktrough.flipXY.text"),
            },
            {
                element: fos_el("#plot-type-button"),
                title: get("walktrough.plotType.title"),
                intro: get("walktrough.plotType.text"),
            },
            {
                element: aos_el("#n-axis"),
                title: get("walktrough.nAxis.title"),
                intro: get("walktrough.nAxis.text"),
            },
            {
                element: aos_el("#show-subtitles"),
                title: get("walktrough.showSubtitles.title"),
                intro: get("walktrough.showSubtitles.text"),
            },
            {
                element: aos_el("#show-coltitle1"),
                title: get("showColTitle1.label"),
                intro: get("walktrough.showColTitle1.text"),
            },
            {
                element: aos_el("#show-mean"),
                title: get("showMean.label"),
                intro: get("walktrough.showMean.text"),
            },
            {
                element: aos_el("#separate-headers"),
                title: get("separateHeaders.label"),
                intro: get("walktrough.separateHeaders.text"),
            },
            {
                element: aos_el("#font-size"),
                title: get("fontSize.label"),
                intro: get("walktrough.fontSize.text"),
            },

            {
                element: aos_el("#show-text"),
                title: get("showText.label"),
                intro:
                    get("walktrough.showText.text1") +
                    get("showText.always") +
                    get("walktrough.showText.textpt1") +
                    get("showText.never") +
                    get("walktrough.showText.textpt2") +
                    get("showText.ifGE5") +
                    get("walktrough.showText.textpt3"),
            },
            {
                element: aos_el("#axis-labels"),
                title: get("walktrough.axisLabels.title"),
                intro:
                    get("walktrough.axisLabels.text1") +
                    get("axisLabels.truncate") +
                    get("walktrough.axisLabels.textpt1") +
                    get("axisLabels.whole") +
                    get("walktrough.axisLabels.textpt2"),
            },
            {
                element: cos_el("#colorscale-selector"),
                title: get("color.scale"),
                intro: get("walktrough.colorscaleSelector.text"),
            },
            {
                element: cos_el("#colorscheme-selector"),
                title: get("color.scheme"),
                intro: get("walktrough.colorschemeSelector.text"),
            },
            {
                element: tds_el("#save-app"),
                title: get("saveSettings.label"),
                intro: get("walktrough.saveSettings.text"),
            },
        ],
    };
    return advanced_elements;
}
