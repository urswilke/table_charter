import { html, render } from 'lit'
import { $, expect } from '@wdio/globals'

import '../tableCharter.js'

render(
    html`<table-charter></table-charter>`,
    document.body
)

const table_charter_el = await $('table-charter')
const button = await table_charter_el.$('>>>button[data-test-id="show-hide-button"]')
const question_selector_el = await table_charter_el.$('>>>question-selector[data-test-id="question-selector"]')
const all_questions = await question_selector_el.$$(">>>option").map(x => x.getText())
const question_select_el = await question_selector_el.$(">>>select")
const header_selector_el = await table_charter_el.$(">>>multi-selector#headers")
const subheader_selector = await header_selector_el.$(">>>select#children-selector").parentElement()
const color_selector_el = await table_charter_el.$('>>>colorscale-selector[data-test-id="color-scale-selector"]').parentElement()
    
describe('Button "Show/hide advanced settings" testing', () => {
    it('should change text to "Hide advanced settings" on click', async () => {
        await expect(subheader_selector).toHaveElementClass('hide')
        await expect(color_selector_el).toHaveElementClass('hide')
        await button.click()
        await expect(subheader_selector).not.toHaveElementClass('hide')
        await expect(color_selector_el).not.toHaveElementClass('hide')

        await expect(button).toHaveText('Hide advanced settings')
    })

    it('should change text back to "Show advanced settings" on click', async () => {
        await button.click()
        await expect(subheader_selector).toHaveElementClass('hide')
        await expect(button).toHaveText('Show advanced settings')
        await expect(color_selector_el).toHaveElementClass('hide')
    })
})

const ojs_plot_el = table_charter_el.$('>>>ojs-plot[data-test-id="ojs-plot"]')
const fig_el = await ojs_plot_el.$(">>>figure")
describe('Check plots', () => {
    it('should exist from start', async () => {
        await expect(fig_el).toBeExisting()
    })
})

describe('Check all questions', () => {
    it('should have all question texts in question-selector', async () => {
        await expect(all_questions).toMatchSnapshot()
    })
    for (const question_text of all_questions) {
        // console.log('aaaaaaaaaaaaaaaaaaaaaa :>> ', question_text);
        it('question: ' + question_text.substring(0, 40) + "...", async () => {
            await question_select_el.selectByVisibleText(question_text)
            // await browser.pause(300)
            await fig_el.isExisting()
            const fig_header = await ojs_plot_el.$('>>>h2[data-test-id="plot-header"]').getText()
            const fig_string = fig_header.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
            // console.log('fig_string :>> ', fig_string);
            // console.log('question_text :>> ', question_text.replace(/(?:\r\n|\r|\n)/g, ' ').trim());
            await expect(
                fig_string === question_text.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
            ).toBe(true)
        })
    }
})
