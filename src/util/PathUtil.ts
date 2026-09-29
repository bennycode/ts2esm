import path from 'node:path';
import type {ModuleInfo} from '../parser/InfoParser.js';

/**
 * When multiple patterns match a module specifier, the pattern with the longest matching prefix before any * token is used. That's why the length of the matching pattern is being returned instead of just a boolean value.
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#wildcard-substitutions
 */
export function isMatchingPath(pattern: string, path: string) {
  // Everything before the wildcard has to match, so "@lib/*" matches "@lib/utils" but not "@lib" or "@library"
  const wildcardIndex = pattern.indexOf('*');
  const prefix = wildcardIndex === -1 ? pattern : pattern.slice(0, wildcardIndex);
  if (path.startsWith(prefix)) {
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
  let bestRank = 0;
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

/***
 * Use this if your path includes a path alias. Returns one path per alias target, in the order TypeScript tries them.
 * @param pathsBaseDirectory Directory that the "paths" in tsconfig.json are relative to
 */
export function getNormalizedPaths(
  pathsBaseDirectory: string,
  info: Pick<ModuleInfo, 'pathAlias' | 'quoteSymbol' | 'normalized'>,
  paths: Record<string, string[]>
) {
  const normalizedFilePath = removePathAlias(info.pathAlias, info.normalized);
  return (paths[info.pathAlias] ?? []).map(target => {
    const normalizedResolution = removeWildCards(target).replaceAll(info.quoteSymbol, '');
    return path.join(pathsBaseDirectory, normalizedResolution, normalizedFilePath);
  });
}

export function hasRelativePath(path: string) {
  if (path === '.' || path === '..') {
    return true;
  }
  return path.startsWith('./') || path.startsWith('../');
}
