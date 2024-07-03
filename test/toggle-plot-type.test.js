import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import data from "../src/example_tablebook_sample.json";

import "../src/tableCharter.js";

render(html`<table-charter .data=${data}></table-charter>`, document.body);

// TODO: add general settings element where (among other stuff...):
// the advanced settings can be set to be shown from the beginning instead of:
const advanced_menu_button = await $(
    '>>>button[data-test-id="toggle-advanced-menu-button"]',
);
await advanced_menu_button.moveTo();
await advanced_menu_button.click();

const plot_type_button = await $('>>>button[data-test-id="plot-type-button"]');

describe("Toggle plot type", () => {
    it("works", async () => {
        // await browser.debug();
        let bar_plot_rects_g;
        let n_bars;
        let dot_plot_points_g;
        let n_dots;

        // shows bar plot initially
        bar_plot_rects_g = await $('>>>[aria-label="bar"]');
        n_bars = await bar_plot_rects_g.$$(">>>rect").length;
        dot_plot_points_g = await $('>>>[aria-label="dot"]');
        expect(await dot_plot_points_g.waitForExist({ reverse: true })).toBe(
            true,
        );
        await expect(n_bars).toEqual(25);

        // shows dot plot after clicking
        plot_type_button.click();
        dot_plot_points_g = await $('>>>[aria-label="dot"]');
        n_dots = await dot_plot_points_g.$$(">>>circle").length;
        bar_plot_rects_g = await $('>>>[aria-label="bar"]');

        expect(await bar_plot_rects_g.waitForExist({ reverse: true })).toBe(
            true,
        );
        await expect(n_dots).toEqual(25);

        // again shows bar plot after clicking again:
        plot_type_button.click();
        bar_plot_rects_g = await $('>>>[aria-label="bar"]');
        n_bars = await bar_plot_rects_g.$$(">>>rect").length;
        dot_plot_points_g = await $('>>>[aria-label="dot"]');
        expect(await dot_plot_points_g.waitForExist({ reverse: true })).toBe(
            true,
        );
        await expect(n_bars).toEqual(25);
    });
});
