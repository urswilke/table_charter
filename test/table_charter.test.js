// import * as XLSX from "xlsx";
import { describe, expect, it, beforeEach, test, beforeAll } from 'vitest'
// import { userEvent, fireEvent, waitFor } from '@testing-library/user-event'
import { TableCharter } from '../src/main'

// beforeAll(async () => {
//     const tc = document.createElement("table-charter");
//     document.body.appendChild(tc);
// })
// const tc = document.createElement("table-charter");
// document.body.appendChild(tc);


await describe('element-creation', async () => {
    const fu = document.body.querySelector('table-charter')
    test('table-charter element found', () => {
        // console.log(fu)
        expect(fu).toBeNull()
    });
    const fu2 = document.body.querySelector('table-book-upload')
    test('table-book-upload element found', () => {
        expect(fu2).toBeDefined()
    })


    const ojsp = document.body.querySelector('ojs-plot')
    test('ojs-plot element found', async () => {
        expect(ojsp).toBeNull()
        console.log(ojsp)

    })
})
