import { html, render } from 'lit'
import { $, expect } from '@wdio/globals'

import '../tableCharter.js'

describe('Lit component testing', () => {
    it('should change text to "Hide advanced settings" on click', async () => {
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
        await button.click()
        await expect(button).toHaveText('Hide advanced settings')
    })
})
