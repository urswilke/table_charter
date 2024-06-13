import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import "../src/tableCharter.js";
import data from "../src/example_tablebook_sample.json";

render(
    html`<table-charter .data=${data} walkthrough="hide"></table-charter>`,
    document.body,
);

const table_charter_el = await $("table-charter");
const advanced_menu_button = await table_charter_el.$(
    '>>>button[data-test-id="toggle-advanced-menu-button"]',
);
const header_selector_el = await table_charter_el.$(
    ">>>multi-selector#headers",
);
const subheader_selector = await header_selector_el
    .$(">>>select#children-selector")
    .parentElement();
const settings_el = await table_charter_el.$(
    '>>>div[data-test-id="settings-div"]',
);

describe('Button "Show/hide advanced settings" testing', () => {
    it("should change text on click and show hidden", async () => {
        var display_prop = await subheader_selector.getCSSProperty("display");
        await expect(display_prop.value).toEqual("none");
        display_prop = await settings_el.getCSSProperty("display");
        await expect(display_prop.value).toEqual("none");

        await expect(subheader_selector).toHaveElementClass("hide");
        await expect(settings_el).toHaveElementClass("hide");
        await advanced_menu_button.moveTo();
        await advanced_menu_button.click();
        display_prop = await subheader_selector.getCSSProperty("display");
        await expect(display_prop.value).not.toEqual("none");

        await expect(subheader_selector).not.toHaveElementClass("hide");
        await expect(settings_el).not.toHaveElementClass("hide");
        display_prop = await settings_el.getCSSProperty("display");
        await expect(display_prop.value).not.toEqual("none");

        await expect(advanced_menu_button).toHaveText("Hide advanced settings");
    });

    it("should change text on click and hide elements again", async () => {
        // await browser.debug()
        await advanced_menu_button.moveTo();
        await advanced_menu_button.click();
        await expect(subheader_selector).toHaveElementClass("hide");
        await expect(advanced_menu_button).toHaveText("Show advanced settings");
        await expect(settings_el).toHaveElementClass("hide");
    });
});
