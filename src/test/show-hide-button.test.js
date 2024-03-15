import { html, render } from "lit";
import { $, expect } from "@wdio/globals";

import "../tableCharter.js";
render(html`<table-charter></table-charter>`, document.body);

const table_charter_el = await $("table-charter");
const adv_settings_button = await table_charter_el.$(
    '>>>button[data-test-id="show-hide-button"]',
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
    it('should change text to "Hide advanced settings" on click', async () => {
        await expect(subheader_selector).toHaveElementClass("hide");
        await expect(settings_el).toHaveElementClass("hide");
        await adv_settings_button.click();
        await expect(subheader_selector).not.toHaveElementClass("hide");
        await expect(settings_el).not.toHaveElementClass("hide");

        await expect(adv_settings_button).toHaveText("Hide advanced settings");
    });

    it('should change text back to "Show advanced settings" on click', async () => {
        // await browser.debug()
        await adv_settings_button.moveTo();
        await adv_settings_button.click();
        await expect(subheader_selector).toHaveElementClass("hide");
        await expect(adv_settings_button).toHaveText("Show advanced settings");
        await expect(settings_el).toHaveElementClass("hide");
    });
});
