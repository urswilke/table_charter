// TODO: put the svg save button functionality in the test ??

// import { $, expect } from "@wdio/globals";
// import "../src/tableCharter.js";
// import { html, render } from "lit";
// import { prepare_data } from "../src/utils.js";
// import data_compressed from "../src/example_compressed.json";

// const data = prepare_data(data_compressed).filter((x) =>
//     [0, 1, 2, 29].includes(x.i_tab),
// );
// const data_obj = {
//     type: "uncompressed",
//     data,
// };

// import "../src/tableCharter.js";

// render(html`<table-charter .data=${data_obj}></table-charter>`, document.body);

// const table_charter_el = await $("table-charter");
// const adv_settings_button = await table_charter_el.$(
//     '>>>button[data-test-id="toggle-advanced-menu-button"]',
// );
// const ojs_plot_el = table_charter_el.$('>>>ojs-plot[data-test-id="ojs-plot"]');
// const save_svg_button = await ojs_plot_el.$(
//     '>>>button[data-test-id="save-svg-button"]',
// );
// const question_select_el = await table_charter_el.$(
//     '>>>question-select[data-test-id="question-select"]',
// );
// const header_select_el = await table_charter_el
//     .$('>>>multi-select[data-test-id="header-select"]')
//     .$(">>>.mainsel");
// const row_select_el = await table_charter_el
//     .$('>>>multi-select[data-test-id="row-select"]')
//     .$(">>>.subsel");
// const all_questions = await question_select_el
//     .$$(">>>option")
//     .map((x) => x.getText());
// const question_select_el = await question_select_el.$(">>>select");
// const fig_el = await ojs_plot_el.$(">>>figure");
// await ojs_plot_el.scrollIntoView({ block: "end", inline: "nearest" });
// await adv_settings_button.moveTo();
// await adv_settings_button.click();
// await header_select_el.selectByIndex(1);

// describe("Check all questions", () => {
//     for (const question_text of all_questions) {
//         it(
//             "question: " + question_text.substring(0, 40) + "../src.",
//             async () => {
//                 await question_select_el.selectByVisibleText(question_text);
//                 const options = await row_select_el.$$(">>>option");
//                 if (options.length > 1) {
//                     await options[0].click();
//                     // select first 2 options (if second exists):
//                     await options[1].dragAndDrop(options[0]);
//                 }

//                 await fig_el.isExisting();
//                 // Scroll to the bottom of the element:
//                 await ojs_plot_el.scrollIntoView({
//                     block: "end",
//                     inline: "nearest",
//                 });
//                 await save_svg_button.click();
//             },
//         );
//     }
// });
