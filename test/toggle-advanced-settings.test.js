import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import "../src/tableCharter.js";
import data from "../src/example_tablebook_sample.json";

render(html`<table-charter .data=${data}></table-charter>`, document.body);

const advanced_menu_button = await $(
    '>>>button[data-test-id="toggle-advanced-menu-button"]',
);
const settings_el = await $('>>>[data-test-id="settings-div"]');

describe('Button "Show/hide advanced settings" testing', () => {
    it("should change text on click and show hidden", async () => {
        await advanced_menu_button.moveTo();
        await advanced_menu_button.click();
        await expect(settings_el).not.toHaveAttr("is_collapsed");
        await expect(advanced_menu_button).toHaveText("🧹");

        await advanced_menu_button.moveTo();
        await advanced_menu_button.click();
        await expect(settings_el).toHaveAttr("is_collapsed");
        await expect(advanced_menu_button).toHaveText("🎛️");
    });
});
