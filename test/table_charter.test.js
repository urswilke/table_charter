import * as XLSX from "xlsx";
import { describe, expect, it, beforeEach, test, beforeAll } from 'vitest'
import { userEvent, fireEvent, waitFor } from '@testing-library/user-event'
import { TableCharter } from '../src/main'

beforeAll(async () => {
    const tc = document.createElement("table-charter");
    document.body.appendChild(tc);
})


await describe('000', async () => {
    const fu = document.body.querySelector('table-charter')
    test('table-charter element found', () => {
        expect(fu).toBeDefined()
    });
    const fu2 = document.body.querySelector('table-book-upload')
    test('table-book-upload element found', () => {
        expect(fu2).toBeDefined()
    })


    test('table-book-upload element found', async () => {
        const user = userEvent.setup()
        const tc2 = document.createElement("ojs-plot");
        const dropdown = screen.getByTestId('town') as HTMLSelectElement;

        // var file = JSON.parse('test.json');
        // const tc2 = document.body.querySelector('table-charter')
        console.log(tc2)
        tc2.plot_data = data;
        const ojsp = document.body.querySelector('ojs-plot')
        // const file = await xl_path_to_file('/home/gspusi/javascript/table_charter/Mappe1.xlsx')
        console.log(tc2.plot_data[0])
        console.log(ojsp)
        // user.upload(fu2, file)
    })
})
