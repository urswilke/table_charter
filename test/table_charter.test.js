import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import data from "../src/example_tablebook_sample.json";

import "../src/tableCharter.js";
import {
    clean_data,
    remove_fields,
    replace_field_strings,
} from "./test_utils.js";

render(
    html`<table-charter .data=${data} walkthrough="hide"></table-charter>`,
    document.body,
);

const table_charter_el = await $("table-charter");
const table_data_selector_el = await $(">>>table-data-selector");
const adv_settings_button = await table_charter_el.$(
    '>>>button[data-test-id="show-hide-button"]',
);
const question_selector_el = await table_charter_el.$(
    '>>>question-selector[data-test-id="question-selector"]',
);
const all_questions = await question_selector_el
    .$$(">>>option")
    .map((x) => x.getText());
await question_selector_el.moveTo();
const question_select_el = await question_selector_el.$(">>>select");
const flip_xy_button = await table_charter_el.$(
    '>>>button[data-test-id="flip-xy-button"]',
);
const plot_type_button = await table_charter_el.$(
    '>>>button[data-test-id="plot-type-button"]',
);
const n_checkbox = await table_charter_el.$(
    '>>>input[data-test-id="n-checkbox"]',
);
const num_type_el = await table_charter_el.$(
    '>>>select[data-test-id="num_type-selector"]',
);

const ojs_plot_el = table_charter_el.$('>>>ojs-plot[data-test-id="ojs-plot"]');
const fig_el = await ojs_plot_el.$(">>>figure");
describe("Check plots", () => {
    it("should exist from start", async () => {
        await expect(fig_el).toBeExisting();
        // needed for next test../src.
        // TODO: find cleaner solution!
        await adv_settings_button.moveTo();
        await adv_settings_button.click();
    });
});

describe("Check all questions", () => {
    var plot_option_array = new Array(all_questions.length);
    for (let i = 0; i < all_questions.length; i++) {
        const question_text = all_questions[i];
        it(
            "question: " + question_text.substring(0, 40) + "../src.",
            async () => {
                await question_select_el.moveTo();
                await question_select_el.selectByVisibleText(question_text);
                await fig_el.isExisting();
                const fig_header = await ojs_plot_el
                    .$('>>>h2[data-test-id="plot-header"]')
                    .getText();

                const res = {};

                res["initial"] = await get_options(ojs_plot_el);
                await flip_xy_button.moveTo();
                await flip_xy_button.click();
                res["flip_xy"] = await get_options(ojs_plot_el);
                await flip_xy_button.click();
                await expect(res["initial"]).toEqual(
                    await get_options(ojs_plot_el),
                );

                await plot_type_button.moveTo();
                await plot_type_button.click();
                res["other_type"] = await get_options(ojs_plot_el);
                await plot_type_button.click();
                await expect(res["initial"]).toEqual(
                    await get_options(ojs_plot_el),
                );
                await table_data_selector_el.scrollIntoView({
                    block: "end",
                    inline: "nearest",
                });
                await n_checkbox.moveTo();
                await n_checkbox.click();
                res["add_n"] = await get_options(ojs_plot_el);
                await n_checkbox.click();
                await expect(res["initial"]).toEqual(
                    await get_options(ojs_plot_el),
                );

                // await num_type_el.selectByVisibleText('n');
                // res['total'] = await get_options(ojs_plot_el);
                // await num_type_el.selectByVisibleText('%');
                // await expect(res["initial"]).toEqual(await get_options(ojs_plot_el))

                plot_option_array[i] = res;

                const fig_string = fig_header
                    .replace(/(?:\r\n|\r|\n)/g, " ")
                    .trim();
                await expect(fig_string).toEqual(question_text);
            },
        );
    }
    it("should reproduce the plot options", async () => {
        await expect(plot_option_array).toMatchSnapshot();
    });
});

async function get_options(ojs_plot_el) {
    let plot_options_el_prop = await ojs_plot_el.getProperty("plot_options");

    const current_plot_options = extract_snapshot_options(plot_options_el_prop);
    return Object.entries(current_plot_options);
}

function extract_snapshot_options(plot_options_el_prop) {
    const opts = plot_options_el_prop.options;
    const n_points = plot_options_el_prop.plot_data.length;
    remove_fields(opts, ["data"]);
    clean_data(opts);

    const current_plot_options = {
        input: plot_options_el_prop.input,
        derived: plot_options_el_prop.derived,
        derived_p: plot_options_el_prop.derived_p,
        data: { n_points: n_points },
        options: opts,
    };
    replace_field_strings(current_plot_options);
    return current_plot_options;
}
