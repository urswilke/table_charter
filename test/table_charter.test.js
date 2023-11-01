import * as XLSX from "xlsx";
import { describe, expect, it, beforeEach, test, beforeAll } from 'vitest'
import { userEvent, fireEvent, waitFor } from '@testing-library/user-event'
import { TableCharter } from '../src/main'

beforeAll(async () => {
    const tc = document.createElement("table-charter");
    document.body.appendChild(tc);
})

async function xl_path_to_file(filename) {
    const wb = XLSX.read(filename);
    const ext = filename.slice(filename.lastIndexOf(".") + 1);
    const u8 = XLSX.write(wb, { bookType: ext, type: "buffer" });
    const parts = [ u8 ]; 
    const file = new File(parts, filename, { type: "application/vnd.ms-excel" });
    console.log(u8)
    return file;
}

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
        const file = await xl_path_to_file('/home/gspusi/javascript/table_charter/Mappe1.xlsx')
        console.log(file)
        console.log(user)
        user.upload(fu2, file)
    })
