import type {StringLiteral} from 'ts-morph';
import path from 'node:path';
import {getExtension, hasRelativePath} from './util.js';

export type ModuleInfo = {
  /** Plain import or export declaration including quotes, i.e. "'../UserAPI'" */
  declaration: string;
  /** Directory without trailing slash, i.e. "src/demo" */
  directory: string;
  /** File extension with leading dot, i.e. ".ts". If there is no extension, it will be an empty string. */
  extension: string;
  /** Quote syntax of import statement, i.e. `"` */
  quoteSymbol: string;
  /** Declaration without quotes, i.e. "../UserAPI" */
  normalized: string;
  /** True, if the path starts with a "." or ".." */
  isRelative: boolean;
  /** Path of the source code file in which the declaration was found, i.e. "src/index.ts" */
  sourceFilePath: string;
};

export function parseInfo(sourceFilePath: string, stringLiteral: StringLiteral): ModuleInfo {
  const declaration = stringLiteral.getText();
  const quoteSymbol = stringLiteral.getQuoteKind().toString();
  const directory = path.dirname(sourceFilePath);
  const extension = getExtension(declaration, quoteSymbol);
  const normalized = declaration.replaceAll(quoteSymbol, '');

  return {
    declaration,
    directory,
    extension,
    isRelative: hasRelativePath(normalized),
    normalized,
    quoteSymbol,
    sourceFilePath,
  };
}
