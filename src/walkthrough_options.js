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
    const qt = tds_el("questions-table");
    const qt_el = sel(qt);

    const default_options = {
        dontShowAgain: true,
        dontShowAgainLabel: get("walkthrough.control.dontShowAgainLabel"),
        // TODO: use a string with the BookNo or something...!:
        // dontShowAgainCookie: "hjklfdahlfdassdljkhs",
        nextLabel: get("walkthrough.control.next"),
        prevLabel: get("walkthrough.control.back"),
        doneLabel: get("walkthrough.control.done"),
    };
    const welcome_steps = [
        {
            title: get("walkthrough.welcome.title"),
            intro: get("walkthrough.welcome.text"),
        },
        {
            title: get("walkthrough.general.title"),
            intro: get("walkthrough.general.text"),
        },
    ];
    const num_type_steps = [
        {
            element: tds_el("#num-type-div"),
            title: get("numType.label"),
            intro: get("walkthrough.numTypeDiv.text"),
        },
    ];
    const question_steps = [
        {
            element: tds_el("#question-selector"),
            title: get("question.label"),
            intro: get("walkthrough.question.text"),
        },
    ];
    const header_steps = [
        {
            element: tds_el("#header-multi-sel"),
            title: get("header.label"),
            intro: get("walkthrough.header.text"),
        },
    ];
    const rows_steps = [
        {
            element: tds_el("#row-multi-sel"),
            title: get("rows.label"),
            intro: get("walkthrough.rows.text"),
        },
    ];
    const further_default_steps = [
        ...(!tds.is_minimized
            ? [
                  {
                      element: tc_el("#show-hide"),
                      title: get("walkthrough.showHide.title"),
                      intro: get("walkthrough.showHide.text"),
                      hint: get("walkthrough.showHide.hint"),
                  },
              ]
            : []),
        {
            element: tc_el(".show-help"),
            title: get("walkthrough.showHelp.title"),
            intro: get("walkthrough.showHelp.text"),
            hint: get("walkthrough.showHelp.hint"),
        },
        {
            element: tc_el(".hide-menu"),
            title: get("walkthrough.hideMenu.title"),
            intro: get("walkthrough.hideMenu.text"),
            hint: get("walkthrough.hideMenu.hint"),
        },
    ];
    const header_elements_steps = [
        {
            element: tds_el("#header-multi-sel"),
            title: get("header.label"),
            intro: get("walkthrough.header.advancedText"),
        },
    ];
    const rows_elements_steps = [
        {
            element: tds_el("#row-multi-sel"),
            title: get("rows.label"),
            intro: get("walkthrough.rows.advancedText"),
        },
    ];
    const settings_elements_steps = [
        {
            element: fos_el("#flip-xy-button"),
            title: get("walkthrough.flipXY.title"),
            intro: get("walkthrough.flipXY.text"),
        },
        {
            element: fos_el("#plot-type-button"),
            title: get("walkthrough.plotType.title"),
            intro: get("walkthrough.plotType.text"),
        },
        {
            element: aos_el("#n-axis"),
            title: get("walkthrough.nAxis.title"),
            intro: get("walkthrough.nAxis.text"),
        },
        {
            element: aos_el("#show-subtitles"),
            title: get("walkthrough.showSubtitles.title"),
            intro: get("walkthrough.showSubtitles.text"),
        },
        {
            element: aos_el("#show-coltitle1"),
            title: get("showColTitle1.label"),
            intro: get("walkthrough.showColTitle1.text"),
        },
        {
            element: aos_el("#show-mean"),
            title: get("showMean.label"),
            intro: get("walkthrough.showMean.text"),
        },
        {
            element: aos_el("#separate-headers"),
            title: get("separateHeaders.label"),
            intro: get("walkthrough.separateHeaders.text"),
        },
        {
            element: aos_el("#font-size"),
            title: get("fontSize.label"),
            intro: get("walkthrough.fontSize.text"),
        },

        {
            element: aos_el("#show-text"),
            title: get("showText.label"),
            intro:
                get("walkthrough.showText.text1") +
                get("showText.always") +
                get("walkthrough.showText.textpt1") +
                get("showText.never") +
                get("walkthrough.showText.textpt2") +
                get("showText.ifGE5") +
                get("walkthrough.showText.textpt3"),
        },
        {
            element: aos_el("#axis-labels"),
            title: get("walkthrough.axisLabels.title"),
            intro:
                get("walkthrough.axisLabels.text1") +
                get("axisLabels.truncate") +
                get("walkthrough.axisLabels.textpt1") +
                get("axisLabels.whole") +
                get("walkthrough.axisLabels.textpt2"),
        },
        {
            element: cos_el("#colorscale-selector"),
            title: get("color.scale"),
            intro: get("walkthrough.colorscaleSelector.text"),
        },
        {
            element: cos_el("#colorscheme-selector"),
            title: get("color.scheme"),
            intro: get("walkthrough.colorschemeSelector.text"),
        },
        {
            element: tds_el("#reset-plots"),
            title: get("resetPlots.label"),
            intro: get("walkthrough.resetPlots.text"),
        },
        {
            element: tds_el("#save-app"),
            title: get("saveSettings.label"),
            intro: get("walkthrough.saveSettings.text"),
        },
    ];
    const questions_table_elements_steps = [
        {
            element: tds_el("#tabulator-questions-manager"),
            title: get("walkthrough.questionsTable.intro.title"),
            intro: get("walkthrough.questionsTable.intro.text"),
        },
        {
            element: qt_el(".tabulator-col[tabulator-field='show']"),
            title: get("walkthrough.questionsTable.show.title"),
            intro: get("walkthrough.questionsTable.show.text"),
        },
        {
            element: qt_el(".tabulator-col[tabulator-field='TabTitle']"),
            title: get("walkthrough.questionsTable.question.title"),
            intro: get("walkthrough.questionsTable.question.text"),
        },
        {
            element: qt_el(".tabulator-col[tabulator-field='clone']"),
            title: get("walkthrough.questionsTable.clone.title"),
            intro: get("walkthrough.questionsTable.clone.text"),
        },
    ];

    const res = default_options;

    res.steps = [
        ...welcome_steps,
        ...(tds.params.collapsed["num-type-div"].show ? num_type_steps : []),
        ...(tds.params.collapsed["question-selector"].show
            ? question_steps
            : []),
        ...(tds.params.collapsed["header-multi-sel"].show ? header_steps : []),
        ...(tds.params.collapsed["row-multi-sel"].show ? rows_steps : []),
        ...(tds.params.collapsed["header-multi-sel"].sub
            ? header_elements_steps
            : []),
        ...(tds.params.collapsed["row-multi-sel"].sub
            ? rows_elements_steps
            : []),
        ...(tds.params.collapsed["settings"].show
            ? settings_elements_steps
            : []),
        ...(tds.params.collapsed["tabulator-questions-manager"].show
            ? questions_table_elements_steps
            : []),
        ...further_default_steps,
    ];

    return res;
}
