import {toImport, toImportAttribute} from './ImportConverter.js';

describe('ImportConverter', () => {
  describe('toImportAttribute', () => {
    it('supports JSON Import Attributes', () => {
      expect(
        toImportAttribute({
          declaration: `'./test/fixtures.json'`,
          extension: '.json',
          quoteSymbol: `'`,
        })
      ).toBe(`'./test/fixtures.json' with { type: 'json' }`);
      expect(
        toImportAttribute({
          declaration: `"../test/fixtures.json"`,
          extension: '.json',
          quoteSymbol: `"`,
        })
      ).toBe(`"../test/fixtures.json" with { type: "json" }`);
    });

    it('supports CSS Import Attributes', () => {
      expect(
        toImportAttribute({
          declaration: `'./MyComponent.module.css'`,
          extension: '.css',
          quoteSymbol: `'`,
        })
      ).toBe(`'./MyComponent.module.css' with { type: 'css' }`);
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

    it('does not add a slash after another slash', () => {
      expect(toImport({declaration: "'./io/'", extension: '/index.js', quoteSymbol: "'"})).toBe(`'./io/index.js'`);
    });
  });
});
