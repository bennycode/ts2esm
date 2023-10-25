import {describe, expect, it} from 'vitest';
import {QuoteKind} from 'ts-morph';
import {hasRelativeImport, toESM} from './convert.js';

describe('toESM', () => {
  it('rewrites import statements to include .js', () => {
    expect(toESM(`'./UserAPI'`, QuoteKind.Single)).toBe(`'./UserAPI.js'`);
    expect(toESM(`"./UserAPI"`, QuoteKind.Double)).toBe(`"./UserAPI.js"`);
    expect(toESM(`"./user/UserAPI"`, QuoteKind.Double)).toBe(`"./user/UserAPI.js"`);
  });

  it('creates links to index files', () => {
    expect(toESM(`'../account'`, QuoteKind.Single, true)).toBe(`'../account/index.js'`);
  });
});

describe('hasRelativeImport', () => {
  it('detects relative imports', () => {
    // "."
    expect(hasRelativeImport(`'./UserAPI'`, QuoteKind.Single)).toBe(true);
    expect(hasRelativeImport(`"./UserAPI"`, QuoteKind.Double)).toBe(true);
    // "." with subdirectories
    expect(hasRelativeImport(`'./user/UserAPI'`, QuoteKind.Single)).toBe(true);
    expect(hasRelativeImport(`"./user/UserAPI"`, QuoteKind.Double)).toBe(true);
    // ".."
    expect(hasRelativeImport(`'../UserAPI'`, QuoteKind.Single)).toBe(true);
    expect(hasRelativeImport(`"../UserAPI"`, QuoteKind.Double)).toBe(true);
    // ".." with subdirectories
    expect(hasRelativeImport(`'../user/UserAPI'`, QuoteKind.Single)).toBe(true);
    expect(hasRelativeImport(`"../user/UserAPI"`, QuoteKind.Double)).toBe(true);
    // others
    expect(hasRelativeImport(`'node:path'`, QuoteKind.Single)).toBe(false);
    expect(hasRelativeImport(`'vitest'`, QuoteKind.Single)).toBe(false);
    expect(hasRelativeImport(`"vitest"`, QuoteKind.Double)).toBe(false);
  });

  it('avoids imports that have already a file extension', () => {
    // js
    expect(hasRelativeImport(`'./UserAPI.js'`, QuoteKind.Single)).toBe(false);
    expect(hasRelativeImport(`"../user/UserAPI.js"`, QuoteKind.Double)).toBe(false);
    // json
    expect(hasRelativeImport(`'../test/fixtures.json'`, QuoteKind.Single)).toBe(false);
    expect(hasRelativeImport(`"../test/fixtures.json"`, QuoteKind.Double)).toBe(false);
  });
});
