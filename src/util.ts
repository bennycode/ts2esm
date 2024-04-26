import { type StringLiteral } from 'ts-morph';
import { type ModuleInfo } from './parseInfo.js';

export function hasRelativePath(path: string) {
  if (path === '.' || path === '..') {
    return true;
  }
  return path.startsWith('./') || path.startsWith('../');
}

export function getNormalizedDeclaration(stringLiteral: StringLiteral) {
  const declaration = stringLiteral.getText();
  const quoteSymbol = stringLiteral.getQuoteKind().toString();
  return declaration.replaceAll(quoteSymbol, '');
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
