import path from 'node:path';
import {ModuleInfo} from '../parseInfo.js';

/**
 * When multiple patterns match a module specifier, the pattern with the longest matching prefix before any * token is used. That's why the length of the matching pattern is being returned instead of just a boolean value.
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths
 */
export function isMatchingPath(pattern: string, path: string) {
  const normalized = removeWildCards(pattern);
  if (path.startsWith(normalized)) {
    return pattern.length;
  }
  return 0;
}

/**
 * Turns "@helpers/*" into "@helpers"
 */
export function removeWildCards(pattern: string) {
  return pattern.replace('/*', '').replace('*', '');
}

/**
 * Turns "@helpers/removeSuffix" into "removeSuffix"
 */
export function removePathAlias(alias: string, path: string) {
  return path.replace(removeWildCards(alias), '').replace('/', '');
}

export function findBestMatch(aliasMap: Record<string, string[]>, path: string) {
  let bestRank = 0;
  let bestMatch = '';
  for (const key of Object.keys(aliasMap)) {
    bestRank = isMatchingPath(key, path);
    if (bestRank) {
      bestMatch = key;
    }
  }
  return bestMatch;
}

export function getNormalizedPath(projectDirectory: string, info: ModuleInfo, paths: Record<string, string[]>) {
  const pathAliasResolution = `${paths[info.pathAlias]}`; // ./src/helpers/*
  const normalizedResolution = removeWildCards(pathAliasResolution).replaceAll(info.quoteSymbol, ''); // ./src/helpers
  const normalizedFilePath = removePathAlias(info.pathAlias, info.normalized);
  return path.join(projectDirectory, normalizedResolution, normalizedFilePath);
}
