/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// import {MyElement} from '../src/my-element.js';
import {fixture, assert, expect} from '@open-wc/testing';
import {html} from 'lit';
import { TableCharter } from '../src/tableCharter.js';
// import { OJSPlot } from '../src/ojs-plot.js';
describe('TableCharter', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture(html`
      <table-charter></table-charter>
    `);
    console.log(el)
    expect(el.title).to.equal('');
    expect(el.counter).to.equal(undefined);
  });
})  
// suite('my-element', () => {
//   test('is defined', () => {
//     const el = document.createElement('my-element');
//     assert.instanceOf(el, MyElement);
//   });

//   test('renders with default values', async () => {
//     const el = await fixture(html`<my-element></my-element>`);
//     assert.shadowDom.equal(
//       el,
//       `
//       <h1>Hello, World!</h1>
//       <button part="button">Click Count: 0</button>
//       <slot></slot>
//     `
//     );
//   });

//   test('renders with a set name', async () => {
//     const el = await fixture(html`<my-element name="Test"></my-element>`);
//     assert.shadowDom.equal(
//       el,
//       `
//       <h1>Hello, Test!</h1>
//       <button part="button">Click Count: 0</button>
//       <slot></slot>
//     `
//     );
//   });

//   test('handles a click', async () => {
//     const el = await fixture(html`<my-element></my-element>`);
//     const button = el.shadowRoot.querySelector('button');
//     button.click();
//     await el.updateComplete;
//     assert.shadowDom.equal(
//       el,
//       `
//       <h1>Hello, World!</h1>
//       <button part="button">Click Count: 1</button>
//       <slot></slot>
//     `
//     );
//   });

//   test('styling applied', async () => {
//     const el = await fixture(html`<my-element></my-element>`);
//     await el.updateComplete;
//     assert.equal(getComputedStyle(el).paddingTop, '16px');
//   });
// });
