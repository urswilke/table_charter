import '../src/main.js';
import {fixture, assert} from '@open-wc/testing.js';
import {html} from 'lit/static-html.js';
import {TableCharter} from '../src/tableCharter.js';

suite('table-charter', () => {
  test('is defined', () => {
    const el = document.createElement('table-charter');
    assert.instanceOf(el, TableCharter);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<table-charter></table-charter>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });
})