import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import data from "../src/example_tablebook_sample.json";

import "../src/tableCharter.js";

describe("Table Charter main components", () => {
    beforeEach(async () => {
        render(
            html`<table-charter .data=${data}></table-charter>`,
            document.body,
        );

        const tableCharter = $("table-charter");
    });

    it("renders the main application components", async () => {
        const tableCharter = $("table-charter");

        await expect($(">>>table-data-select")).toBeExisting();

        await expect($('>>>ojs-plot[data-test-id="ojs-plot"]')).toBeExisting();

        await expect($(">>>question-select")).toBeExisting();

        await expect($(">>>multi-select#headers")).toBeExisting();

        await expect($(">>>multi-select#rows")).toBeExisting();
    });

    it("changes the selected question", async () => {
        const questionSelect = $(">>>question-select");
        const select = questionSelect.$(">>>select");
        const options = await select.$$(">>>option");
        expect(options.length).toEqual(data.data.Tab.BookNo.length);
    });

    it("renders the chart after application data is loaded", async () => {
        const plot = $('>>>ojs-plot[data-test-id="ojs-plot"]');

        const plotHeader = plot.$('>>>[data-test-id="plot-header"]');
        await expect(plotHeader).toBeExisting();

        const chart = plot.$$(">>>svg")[0];

        await expect(chart).toBeDisplayed();
    });
});
