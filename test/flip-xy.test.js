import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import data from "../src/example_tablebook_sample.json";

import "../src/tableCharter.js";

render(html`<table-charter .data=${data}></table-charter>`, document.body);

// TODO: add general settings element where (among other stuff...):
// the advanced settings can be set to be shown from the beginning instead of:
const advanced_menu_button = $(
    '>>>button[data-test-id="toggle-advanced-menu-button"]',
);
await advanced_menu_button.moveTo();
await advanced_menu_button.click();

const flip_xy_button = $('>>>button[data-test-id="flip-xy-button"]');
const ojs_plot_el = $('>>>ojs-plot[data-test-id="ojs-plot"]');

describe("Flip xy button", () => {
    it("works", async () => {
        let plot_options, derived_p;

        // shows barY plot initially
        plot_options = await ojs_plot_el.getProperty("plot_options");
        derived_p = plot_options.derived_p;
        await expect(derived_p.bar_).toEqual("barY");
        await expect(derived_p.is_x).toEqual(true);
        await expect(derived_p.stack_).toEqual("stackY");
        await expect(derived_p.text_).toEqual("textY");

        // shows barX plot after clicking button
        await flip_xy_button.click();
        plot_options = await ojs_plot_el.getProperty("plot_options");
        derived_p = plot_options.derived_p;
        await expect(derived_p.bar_).toEqual("barX");
        await expect(derived_p.is_x).toEqual(false);
        await expect(derived_p.stack_).toEqual("stackX");
        await expect(derived_p.text_).toEqual("textX");

        // again shows barY plot after clicking again:
        await flip_xy_button.click();
        plot_options = await ojs_plot_el.getProperty("plot_options");
        derived_p = plot_options.derived_p;
        await expect(derived_p.bar_).toEqual("barY");
        await expect(derived_p.is_x).toEqual(true);
        await expect(derived_p.stack_).toEqual("stackY");
        await expect(derived_p.text_).toEqual("textY");
    });
});
