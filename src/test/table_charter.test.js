import { html, render } from 'lit'
import { $, expect } from '@wdio/globals'

import '../tableCharter.js'

render(
    html`<table-charter></table-charter>`,
    document.body
)
const button = await $('table-charter')
    .shadow$("div.content")
    .$("div.column1")
    .$("table-data-selector")
    .shadow$("div.parent")
    .$("button")

describe('Button "Show/hide advanced settings" testing', () => {
    it('should change text to "Hide advanced settings" on click', async () => {

        await button.click()
        await expect(button).toHaveText('Hide advanced settings')
    })

    it('should change text back to "Show advanced settings" on click', async () => {
        await button.click()
        await expect(button).toHaveText('Show advanced settings')
    })
})
