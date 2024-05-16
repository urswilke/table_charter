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
        ],
    };
    if (tds.params.collapsed_view) {
        return default_elements;
    }
}
