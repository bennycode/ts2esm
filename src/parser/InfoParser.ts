import path from 'node:path';
import type {StringLiteral} from 'ts-morph';
import {findBestMatch, hasRelativePath} from '../util/PathUtil.js';

export type ModuleInfo = {
  /** Plain import or export declaration including quotes, i.e. "'../UserAPI'" */
  declaration: string;
  /** Directory without trailing slash, i.e. "src/demo" */
  directory: string;
  /** File extension with leading dot, i.e. ".ts". If there is no extension, it will be an empty string. */
  extension: string;
  /** Quote symbol being used in the import statement, i.e. `"` */
  quoteSymbol: string;
  /** Declaration without quotes, i.e. "../UserAPI" */
  normalized: string;
  pathAlias: string;
  /** True, if the path starts with a "." or ".." */
  isRelative: boolean;
  /** Path of the source code file in which the declaration was found, i.e. "src/index.ts" */
  sourceFilePath: string;
};

export function getNormalizedDeclaration(stringLiteral: StringLiteral) {
  const declaration = stringLiteral.getText();
  const quoteSymbol = stringLiteral.getQuoteKind().toString();
  return declaration.replaceAll(quoteSymbol, '');
}

/**
 * @param sourceFilePath The absolute path of the source code file containing import declarations
 * @param stringLiteral The import literal (i.e. "lodash/endsWith" or "./removeSuffix")
 */
export function parseInfo(
  sourceFilePath: string,
  stringLiteral: StringLiteral,
  paths: Record<string, string[]> | undefined
): ModuleInfo {
  const declaration = stringLiteral.getText();
  const normalizedDeclaration = getNormalizedDeclaration(stringLiteral);
  const bestPathAliasMatch = paths ? findBestMatch(paths, normalizedDeclaration) : '';
  const quoteSymbol = stringLiteral.getQuoteKind().toString();
  const directory = path.dirname(sourceFilePath);
  const extension = path.extname(normalizedDeclaration);
  const isRelative = hasRelativePath(normalizedDeclaration);

  return {
    declaration,
    directory,
    extension,
    isRelative,
    normalized: path.relative('.', normalizedDeclaration),
    pathAlias: bestPathAliasMatch,
    quoteSymbol,
    sourceFilePath,
  };
}
