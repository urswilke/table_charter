import { get } from "lit-translate";

export function get_walkthrough_options(tds) {
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
                element: tds.renderRoot.querySelector("#num-type-div"),
                title: get("numType.label"),
                intro: get("walktrough.numTypeDiv.text"),
            },
            {
                element: tds.renderRoot.querySelector("#question-selector"),
                title: get("question.label"),
                intro: get("walktrough.question.text"),
            },
            {
                element: tds.renderRoot.querySelector("#header-multi-sel"),
                title: get("header.label"),
                intro: get("walktrough.header.text"),
            },
        ],
    };
}
