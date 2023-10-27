import path from 'node:path';
import type {ModuleInfo} from './parseInfo.js';

export function hasRelativePath(path: string) {
  if (path === '.' || path === '..') {
    return true;
  }
  return path.startsWith('./') || path.startsWith('../');
}

export function getExtension(importPath: string, quoteSymbol: string) {
  const fileName = importPath.replaceAll(quoteSymbol, '');
  return path.extname(fileName);
}

export function toJSON({declaration, quoteSymbol}: Pick<ModuleInfo, 'declaration' | 'quoteSymbol'>) {
  const jsonImportAssertion = `assert {type: ${quoteSymbol}json${quoteSymbol}}`;
  return `${declaration} ${jsonImportAssertion}`;
}

export function toIndex({declaration, quoteSymbol}: Pick<ModuleInfo, 'declaration' | 'quoteSymbol'>) {
  return `${declaration.replace(new RegExp(`${quoteSymbol}$`), `/index.js${quoteSymbol}`)}`;
}

export function toJS({declaration, quoteSymbol}: Pick<ModuleInfo, 'declaration' | 'quoteSymbol'>) {
  return `${declaration.replace(new RegExp(`${quoteSymbol}$`), `.js${quoteSymbol}`)}`;
}
