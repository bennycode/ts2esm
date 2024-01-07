import {describe, expect, it} from 'vitest';
import {QuoteKind} from 'ts-morph';
import {getExtension, hasRelativePath, toJS, toJSON} from './util.js';

describe('hasRelativePath', () => {
  it('detects relative imports', () => {
    // relative paths
    expect(hasRelativePath('.')).toBe(true);
    expect(hasRelativePath('..')).toBe(true);
    expect(hasRelativePath('./user')).toBe(true);
    expect(hasRelativePath('../user/UserAPI')).toBe(true);
    expect(hasRelativePath('../test/fixtures.json')).toBe(true);
    // others
    expect(hasRelativePath('node:path')).toBe(false);
    expect(hasRelativePath('vitest')).toBe(false);
  });
});

describe('getExtension', () => {
  it('returns file extensions or empty strings if no extension is found', () => {
    expect(getExtension(`'./UserAPI'`, QuoteKind.Single)).toBe('');
    expect(getExtension(`"../user/UserAPI"`, QuoteKind.Double)).toBe('');
    expect(getExtension(`"../user/UserAPI.js"`, QuoteKind.Double)).toBe('.js');
    expect(getExtension(`'../test/fixtures.json'`, QuoteKind.Single)).toBe('.json');
    expect(getExtension(`"./test/fixtures.json"`, QuoteKind.Double)).toBe('.json');
  });
});

describe('toJSON', () => {
  it('supports JSON Import Assertions', () => {
    expect(
      toJSON({
        declaration: `'./test/fixtures.json'`,
        quoteSymbol: `'`,
      })
    ).toBe(`'./test/fixtures.json' assert {type: 'json'}`);
    expect(
      toJSON({
        declaration: `"../test/fixtures.json"`,
        quoteSymbol: `"`,
      })
    ).toBe(`"../test/fixtures.json" assert {type: "json"}`);
  });
});

describe('toJS', () => {
  it('adds an ESM-compatible .js extension', () => {
    expect(
      toJS({
        declaration: `'../user/UserAPI'`,
        quoteSymbol: `'`,
      }, '.js')
    ).toBe(`'../user/UserAPI.js'`);
    expect(
      toJS({
        declaration: `"./WebSocketClient"`,
        quoteSymbol: `"`,
      }, '.js')
    ).toBe(`"./WebSocketClient.js"`);
  });

  it('adds an index suffix', () => {
    expect(
      toJS({
        declaration: `'../account'`,
        quoteSymbol: `'`,
      }, '/index.js')
    ).toBe(`'../account/index.js'`);
    expect(
      toJS({
        declaration: `"../account"`,
        quoteSymbol: `"`,
      }, '/index.js')
    ).toBe(`"../account/index.js"`);
    expect(
      toJS({
        declaration: `'.'`,
        quoteSymbol: `'`,
      }, '/index.js')
    ).toBe(`'./index.js'`);
    expect(
      toJS({
        declaration: `"."`,
        quoteSymbol: `"`,
      }, '/index.js')
    ).toBe(`"./index.js"`);
    expect(
      toJS({
        declaration: `'..'`,
        quoteSymbol: `'`,
      }, '/index.js')
    ).toBe(`'../index.js'`);
    expect(
      toJS({
        declaration: `".."`,
        quoteSymbol: `"`,
      }, '/index.js')
    ).toBe(`"../index.js"`);
  });

  it('works with TSX files', () => {
    expect(
      toJS({
        declaration: `'./AppTheme'`,
        quoteSymbol: `'`,
      }, '.jsx')
    ).toBe(`'./AppTheme.jsx'`);
  });

  it('works with module files', () => {
    expect(
      toJS({
        declaration: `'./add'`,
        quoteSymbol: `'`,
      }, '.cjs')
    ).toBe(`'./add.cjs'`);

    expect(
      toJS({
        declaration: `'./add'`,
        quoteSymbol: `'`,
      }, '.mjs')
    ).toBe(`'./add.mjs'`);
  });
});
