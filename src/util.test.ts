import {describe, expect, it} from 'vitest';
import {QuoteKind} from 'ts-morph';
import {getExtension, hasRelativePath, toImport, toImportAssertion} from './util.js';

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

describe('toImportAssertion', () => {
  it('supports JSON Import Assertions', () => {
    expect(
      toImportAssertion({
        declaration: `'./test/fixtures.json'`,
        quoteSymbol: `'`,
        extension: '.json',
      })
    ).toBe(`'./test/fixtures.json' assert {type: 'json'}`);
    expect(
      toImportAssertion({
        declaration: `"../test/fixtures.json"`,
        quoteSymbol: `"`,
        extension: '.json',
      })
    ).toBe(`"../test/fixtures.json" assert {type: "json"}`);
  });

  it('supports CSS Import Assertions', () => {
    expect(
      toImportAssertion({
        declaration: `'./MyComponent.module.css'`,
        quoteSymbol: `'`,
        extension: '.css',
      })
    ).toBe(`'./MyComponent.module.css' assert {type: 'css'}`);
  });
});

describe('toImport', () => {
  it('adds an ESM-compatible .js extension', () => {
    expect(
      toImport({
        declaration: `'../user/UserAPI'`,
        quoteSymbol: `'`,
        extension: '.js',
      })
    ).toBe(`'../user/UserAPI.js'`);
    expect(
      toImport({
        declaration: `"./WebSocketClient"`,
        quoteSymbol: `"`,
        extension: '.js',
      })
    ).toBe(`"./WebSocketClient.js"`);
  });

  it('adds an index suffix', () => {
    expect(
      toImport({
        declaration: `'../account'`,
        quoteSymbol: `'`,
        extension: '/index.js',
      })
    ).toBe(`'../account/index.js'`);
    expect(
      toImport({
        declaration: `"../account"`,
        quoteSymbol: `"`,
        extension: '/index.js',
      })
    ).toBe(`"../account/index.js"`);
    expect(
      toImport({
        declaration: `'.'`,
        quoteSymbol: `'`,
        extension: '/index.js',
      })
    ).toBe(`'./index.js'`);
    expect(
      toImport({
        declaration: `"."`,
        quoteSymbol: `"`,
        extension: '/index.js',
      })
    ).toBe(`"./index.js"`);
    expect(
      toImport({
        declaration: `'..'`,
        quoteSymbol: `'`,
        extension: '/index.js',
      })
    ).toBe(`'../index.js'`);
    expect(
      toImport({
        declaration: `".."`,
        quoteSymbol: `"`,
        extension: '/index.js',
      })
    ).toBe(`"../index.js"`);
  });

  it('works with TSX files', () => {
    expect(
      toImport({
        declaration: `'./AppTheme'`,
        quoteSymbol: `'`,
        extension: '.jsx',
      })
    ).toBe(`'./AppTheme.jsx'`);
  });

  it('works with module files', () => {
    expect(
      toImport({
        declaration: `'./add'`,
        quoteSymbol: `'`,
        extension: '.cjs',
      })
    ).toBe(`'./add.cjs'`);

    expect(
      toImport({
        declaration: `'./add'`,
        quoteSymbol: `'`,
        extension: '.mjs',
      })
    ).toBe(`'./add.mjs'`);
  });
});
