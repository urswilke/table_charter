import { html, fixture, expect } from '@open-wc/testing';

import { TableCharter } from '../src/tableCharter.js';

// describe('TableCharter', () => {
//   // it('has a default title "Hey there" and counter 5', async () => {
//   //   const el = await fixture(html`
//   //     <table-charter></table-charter>
//   //   `);
//   //   console.log(el)
//   //   expect(el.title).to.equal('Hey there');
//   //   expect(el.counter).to.equal(5);
//   // });

//   it('increases the counter on button click', async () => {
//     // const el = await fixture(html`
//     //   <table-charter></table-charter>
//     // `);
//     const el = document.createElement('table-charter');
//     assert.instanceOf(el, TableCharter);

//     console.log(el)
//     // el.shadowRoot.querySelector('ojs-plot').click();

//     // expect(el.plot_data).to.equal(1);
//   });


  suite('my-element', () => {
    test('is defined', () => {
      const el = document.createElement('table-charter');
      assert.instanceOf(el, TableCharter);
    });
  })  

  // it('can override the title via attribute', async () => {
  //   const el = await fixture(html`
  //     <table-charter title="attribute title"></table-charter>
  //   `);

  //   expect(el.title).to.equal('attribute title');
  // });

  // it('passes the a11y audit', async () => {
  //   const el = await fixture(html`
  //     <table-charter></table-charter>
  //   `);

  //   await expect(el).shadowDom.to.be.accessible();
  // });
// });