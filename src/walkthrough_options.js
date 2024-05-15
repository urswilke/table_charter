import { get } from "lit-translate";

export function get_walkthrough_options(tds) {
    const el = (x) => tds.renderRoot.querySelector(x);
    return {
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
                element: el("#num-type-div"),
                title: get("numType.label"),
                intro: get("walktrough.numTypeDiv.text"),
            },
            {
                element: el("#question-selector"),
                title: get("question.label"),
                intro: get("walktrough.question.text"),
            },
            {
                element: el("#header-multi-sel"),
                title: get("header.label"),
                intro: get("walktrough.header.text"),
            },
            {
                element: el("#row-multi-sel"),
                title: get("rows.label"),
                intro: get("walktrough.rows.text"),
            },
        ],
    };
}
