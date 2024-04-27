import path from 'node:path';
import type {ModuleInfo} from '../parseInfo.js';

/**
 * When multiple patterns match a module specifier, the pattern with the longest matching prefix before any * token is used. That's why the length of the matching pattern is being returned instead of just a boolean value.
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#wildcard-substitutions
 */
export function isMatchingPath(pattern: string, path: string) {
  const normalized = removeWildCards(pattern);
  if (path.startsWith(normalized)) {
    return pattern.length;
  }
  return 0;
}

export function removeWildCards(pattern: string) {
  return pattern.replace('/*', '').replace('*', '');
}

export function removePathAlias(alias: string, path: string) {
  return path.replace(removeWildCards(alias), '').replace('/', '');
}

export function findBestMatch(aliasMap: Record<string, string[]>, path: string) {
  let bestRank = -1;
  let bestMatch = '';
  for (const key of Object.keys(aliasMap)) {
    const rank = isMatchingPath(key, path);
    if (rank > bestRank) {
      bestRank = rank;
      bestMatch = key;
    }
  }
  return bestMatch;
}

export function getNormalizedPath(
  projectDirectory: string,
  info: Pick<ModuleInfo, 'pathAlias' | 'quoteSymbol' | 'normalized'>,
  paths: Record<string, string[]>
) {
  const pathAliasResolution = `${paths[info.pathAlias]}`;
  const normalizedResolution = removeWildCards(pathAliasResolution).replaceAll(info.quoteSymbol, '');
  const normalizedFilePath = removePathAlias(info.pathAlias, info.normalized);
  return path.join(projectDirectory, normalizedResolution, normalizedFilePath);
}
