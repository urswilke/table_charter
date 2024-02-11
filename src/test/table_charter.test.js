import { html, render } from 'lit'
import { $, expect } from '@wdio/globals'

import '../tableCharter.js'
import { clean_data, remove_fields, replace_field_strings } from './test_utils.js'

render(
    html`<table-charter></table-charter>`,
    document.body
)

const table_charter_el = await $('table-charter')
const table_data_selector_el = await $('>>>table-data-selector')
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
    var plot_option_array = new Array(all_questions.length);
    for (const question_text of all_questions) {
        it('question: ' + question_text.substring(0, 40) + "...", async () => {
            await question_select_el.selectByVisibleText(question_text)
            await fig_el.isExisting()
            const fig_header = await ojs_plot_el.$('>>>h2[data-test-id="plot-header"]').getText()
            let plot_options_el_prop = await ojs_plot_el.getProperty('plot_options');

            const current_plot_options = extract_snapshot_options(plot_options_el_prop)
            plot_option_array[current_plot_options.input.i_tab] = Object.entries(current_plot_options);
            
            const fig_string = fig_header.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
            await expect(fig_string).toEqual(question_text)
        })
    }
    it('should reproduce the plot options', async () => {
        await expect(plot_option_array).toMatchSnapshot()
    })
})

function extract_snapshot_options(plot_options_el_prop) {
    const opts = plot_options_el_prop.options;
    const n_points = plot_options_el_prop.plot_data.length
    remove_fields(opts, ['data'])
    clean_data(opts)

    const current_plot_options = {
        input: plot_options_el_prop.o,
        derived: plot_options_el_prop.e,
        derived_p: plot_options_el_prop.p,
        data: { n_points: n_points},
        options: opts
    }
    replace_field_strings(current_plot_options)
    return current_plot_options
}

