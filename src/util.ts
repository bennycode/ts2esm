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

export function toImportAssertion({
  declaration,
  quoteSymbol,
  extension,
}: Pick<ModuleInfo, 'declaration' | 'quoteSymbol' | 'extension'>) {
  const type = extension.replace('.', '');
  const importAssertion = `assert {type: ${quoteSymbol}${type}${quoteSymbol}}`;
  return `${declaration} ${importAssertion}`;
}

export function toImport({
  declaration,
  quoteSymbol,
  extension,
}: Pick<ModuleInfo, 'declaration' | 'quoteSymbol' | 'extension'>) {
  return `${declaration.replace(new RegExp(`${quoteSymbol}$`), `${extension}${quoteSymbol}`)}`;
}
