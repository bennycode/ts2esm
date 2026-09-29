import {SourceFile, StringLiteral} from 'ts-morph';
import {ModuleInfo, parseInfo} from '../parser/InfoParser.js';
import {ProjectUtil} from './ProjectUtil.js';
import {toImport, toImportAttribute} from '../converter/ImportConverter.js';
import {getNormalizedPaths, isNodeModuleRoot} from './PathUtil.js';
import path from 'node:path';
import {PathFinder} from './PathFinder.js';

export function replaceModulePath({
  hasAttributesClause,
  stringLiteral,
  sourceFile,
}: {
  hasAttributesClause: boolean;
  stringLiteral: StringLiteral;
  sourceFile: SourceFile;
}) {
  const paths = ProjectUtil.getPaths(sourceFile.getProject());
  const tsConfigFilePath = ProjectUtil.getTsConfigFilePath(sourceFile);
  const projectDirectory = ProjectUtil.getRootDirectory(tsConfigFilePath);
  const pathsBaseDirectory = ProjectUtil.getPathsBaseDirectory(sourceFile);
  const info = parseInfo(sourceFile.getFilePath(), stringLiteral, paths);
  const replacement = createReplacementPath({hasAttributesClause, info, paths, pathsBaseDirectory, projectDirectory});
  if (replacement) {
    stringLiteral.replaceWithText(replacement);
    return true;
  }
  return false;
}

function createReplacementPath({
  hasAttributesClause,
  info,
  paths,
  pathsBaseDirectory,
  projectDirectory,
}: {
  hasAttributesClause: boolean;
  info: ModuleInfo;
  paths: Record<string, string[]> | undefined;
  pathsBaseDirectory: string;
  projectDirectory: string;
}) {
  if (hasAttributesClause) {
    return null;
  }

  const comesFromPathAlias = !!info.pathAlias && !!paths;
  const isNodeModulesPath = !info.isRelative && info.normalized.includes('/') && !comesFromPathAlias;
  if (info.isRelative || comesFromPathAlias || isNodeModulesPath) {
    if (['.json', '.css'].includes(info.extension)) {
      return toImportAttribute(info);
    }

    // If an import does not have a file extension or isn't an extension recognized here and can't be found locally (perhaps
    // file had . in name), try to find a matching file by traversing through all valid TypeScript source file extensions.
    let baseFilePaths = comesFromPathAlias
      ? getNormalizedPaths(pathsBaseDirectory, info, paths)
      : [path.join(info.directory, info.normalized)];
    if (isNodeModulesPath) {
      baseFilePaths = [path.join(projectDirectory, 'node_modules', info.normalized)];
    }

    for (const baseFilePath of baseFilePaths) {
      const foundPath = PathFinder.findPath(baseFilePath, info.extension);
      if (!foundPath) {
        continue;
      }
      // TODO: Write test case for this condition, mock "path" and "fs" calls if necessary
      if (foundPath.extension === '/index.js' && isNodeModuleRoot(baseFilePath)) {
        // @fixes https://github.com/bennycode/ts2esm/issues/81#issuecomment-2437503011
        return null;
      }
      return toImport({...info, extension: foundPath.extension});
    }
  }
  return null;
}
