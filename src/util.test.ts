import { hasRelativePath, toImport, toImportAssertion } from './util.js';

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

describe('toImportAssertion', () => {
  it('supports JSON Import Assertions', () => {
    expect(
      toImportAssertion({
        declaration: `'./test/fixtures.json'`,
        extension: '.json',
        quoteSymbol: `'`,
      })
    ).toBe(`'./test/fixtures.json' assert {type: 'json'}`);
    expect(
      toImportAssertion({
        declaration: `"../test/fixtures.json"`,
        extension: '.json',
        quoteSymbol: `"`,
      })
    ).toBe(`"../test/fixtures.json" assert {type: "json"}`);
  });

  it('supports CSS Import Assertions', () => {
    expect(
      toImportAssertion({
        declaration: `'./MyComponent.module.css'`,
        extension: '.css',
        quoteSymbol: `'`,
      })
    ).toBe(`'./MyComponent.module.css' assert {type: 'css'}`);
  });
});

describe('toImport', () => {
  it('adds an ESM-compatible .js extension', () => {
    expect(
      toImport({
        declaration: `'../user/UserAPI'`,
        extension: '.js',
        quoteSymbol: `'`,
      })
    ).toBe(`'../user/UserAPI.js'`);

    expect(
      toImport({
        declaration: `"helpers/removeSuffix"`,
        extension: '.js',
        quoteSymbol: `"`,
      })
    ).toBe(`"helpers/removeSuffix.js"`);

    expect(
      toImport({
        declaration: `"./WebSocketClient"`,
        extension: '.js',
        quoteSymbol: `"`,
      })
    ).toBe(`"./WebSocketClient.js"`);
  });

  it('adds an index suffix', () => {
    expect(
      toImport({
        declaration: `'../account'`,
        extension: '/index.js',
        quoteSymbol: `'`,
      })
    ).toBe(`'../account/index.js'`);
    expect(
      toImport({
        declaration: `"../account"`,
        extension: '/index.js',
        quoteSymbol: `"`,
      })
    ).toBe(`"../account/index.js"`);
    expect(
      toImport({
        declaration: `'.'`,
        extension: '/index.js',
        quoteSymbol: `'`,
      })
    ).toBe(`'./index.js'`);
    expect(
      toImport({
        declaration: `"."`,
        extension: '/index.js',
        quoteSymbol: `"`,
      })
    ).toBe(`"./index.js"`);
    expect(
      toImport({
        declaration: `'..'`,
        extension: '/index.js',
        quoteSymbol: `'`,
      })
    ).toBe(`'../index.js'`);
    expect(
      toImport({
        declaration: `".."`,
        extension: '/index.js',
        quoteSymbol: `"`,
      })
    ).toBe(`"../index.js"`);
  });

  it('works with TSX files', () => {
    expect(
      toImport({
        declaration: `'./AppTheme'`,
        extension: '.jsx',
        quoteSymbol: `'`,
      })
    ).toBe(`'./AppTheme.jsx'`);
  });

  it('works with module files', () => {
    expect(
      toImport({
        declaration: `'./add'`,
        extension: '.cjs',
        quoteSymbol: `'`,
      })
    ).toBe(`'./add.cjs'`);

    expect(
      toImport({
        declaration: `'./add'`,
        extension: '.mjs',
        quoteSymbol: `'`,
      })
    ).toBe(`'./add.mjs'`);
  });
});
