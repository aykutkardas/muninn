import { expect } from 'chai';
import 'mocha';

import * as cheerio from 'cheerio';

import getValue from './getValue';

const BLOCK_HTML = `
<div class="parent">
  <div class="first-child">First Child</div>
  <div class="second-child">Second Child</div>
  <div class="third-child">Third Child</div>
  <div class="full-child">Content</div>
  <div class="empty-child"></div>
  <div class="number-content-child">632</div>
  <div class="regex-test-child">Year 2021</div>
  <div class="trim-child"> Trim Content </div>
  <div class="html-child"><div class="content">Test</div></div>
  <div class="regex-template-test-child">https://example.com/ > example > test</div>
  <a class="link" href="https://example.com/">Test Url</a>
</div>
`;

const SAMPLE_HTML = `
<body>
  <div class="blocks">
    <div class="unblock">Unblock</div>
    ${BLOCK_HTML.repeat(4)}
  </div>
</body>
`;

const $ = cheerio.load(SAMPLE_HTML);

describe('getValue Tests', () => {
  it('Case 1:  { selector }', () => {
    const config = { selector: '.first-child' };
    const value = getValue({ $ }, config);
    expect('First Child').to.deep.equal(value);
  });

  it('Case 2:  { [selector, selector] }', () => {
    const el = '.parent';
    const config = { selector: ['.first-child', '.second-child'] };
    const value = getValue({ $, el }, config);
    expect('First Child').to.deep.equal(value);
  });

  it('Case 3:  { [selector, selector], array }', () => {
    const el = $('.parent').first();
    const config = {
      selector: ['.first-child', '.second-child'],
      type: 'array'
    };
    const value = getValue({ $, el }, config);
    expect(['First Child', 'Second Child']).to.deep.equal(value);
  });

  it('Case 4:  { selector, schema }', () => {
    const el = $('.blocks').first();
    const config = {
      selector: '.parent',
      schema: {
        firstChild: '.first-child',
        secondChild: '.second-child'
      }
    };
    const value = getValue({ $, el }, config);
    expect({
      firstChild: 'First Child',
      secondChild: 'Second Child'
    }).to.deep.equal(value);
  });

  it('Case 5:  { selector, schema, array }', () => {
    const el = $('.blocks');
    const config = {
      selector: '.parent',
      type: 'array',
      schema: {
        firstChild: '.first-child',
        secondChild: '.second-child'
      }
    };
    const value = getValue({ $, el }, config);
    expect([
      {
        firstChild: 'First Child',
        secondChild: 'Second Child'
      },
      {
        firstChild: 'First Child',
        secondChild: 'Second Child'
      },
      {
        firstChild: 'First Child',
        secondChild: 'Second Child'
      },
      {
        firstChild: 'First Child',
        secondChild: 'Second Child'
      }
    ]).to.deep.equal(value);
  });

  it('Case 6:  { selector, schema: { selector: schema } }', () => {
    const config = {
      selector: '.blocks',
      schema: {
        parent: {
          selector: '.parent',
          type: 'array',
          schema: {
            firstChild: '.first-child',
            secondChild: '.second-child'
          }
        }
      }
    };
    const value = getValue({ $ }, config);
    expect({
      parent: [
        {
          firstChild: 'First Child',
          secondChild: 'Second Child'
        },
        {
          firstChild: 'First Child',
          secondChild: 'Second Child'
        },
        {
          firstChild: 'First Child',
          secondChild: 'Second Child'
        },
        {
          firstChild: 'First Child',
          secondChild: 'Second Child'
        }
      ]
    }).to.deep.equal(value);
  });

  it('Case 7:  { selector, trim }', () => {
    const config = { selector: '.trim-child' };
    const value = getValue({ $ }, config);
    expect('Trim Content').to.deep.equal(value);
  });

  it('Case 8:  { selector, trim: false }', () => {
    const config = { selector: '.trim-child', trim: false };
    const value = getValue({ $ }, config);
    expect(' Trim Content ').to.deep.equal(value);
  });

  it('Case 9:  { selector, attr }', () => {
    const config = { selector: '.link', attr: 'href' };
    const value = getValue({ $ }, config);
    expect('https://example.com/').to.deep.equal(value);
  });

  it('Case 10: { selector, html }', () => {
    const config = { selector: '.html-child', html: true };
    const value = getValue({ $ }, config);
    expect('<div class="content">Test</div>').to.deep.equal(value);
  });

  it('Case 11: { selector, custom }', () => {
    const config = {
      selector: '.parent',
      type: 'array',
      schema: {
        link: {
          selector: 'a.link',
          attr: 'href',
          custom: (val) => 'Link: ' + val
        }
      }
    };
    const value = getValue({ $ }, config);
    expect([
      { link: 'Link: https://example.com/' },
      { link: 'Link: https://example.com/' },
      { link: 'Link: https://example.com/' },
      { link: 'Link: https://example.com/' }
    ]).to.deep.equal(value);
  });
});
