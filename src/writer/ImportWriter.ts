import type { ModuleInfo } from '../parser/InfoParser.js';

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
