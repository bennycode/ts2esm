import {SourceFile, StringLiteral, ts} from 'ts-morph';
import {ModuleInfo, parseInfo} from '../parser/InfoParser.js';
import {ProjectUtil} from './ProjectUtil.js';
import {toImport, toImportAttribute} from '../converter/ImportConverter.js';
import {getNormalizedPath} from './PathUtil.js';
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
  const info = parseInfo(sourceFile.getFilePath(), stringLiteral, paths);
  const replacement = createReplacementPath({hasAttributesClause, info, paths, projectDirectory});
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
  projectDirectory,
}: {
  hasAttributesClause: boolean;
  info: ModuleInfo;
  paths: Record<string, string[]> | undefined;
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

    if (isNodeModulesPath) {
      return createPackageImportPath(info);
    }

    // If an import does not have a file extension or isn't an extension recognized here and can't be found locally (perhaps
    // file had . in name), try to find a matching file by traversing through all valid TypeScript source file extensions.
    const baseFilePath = comesFromPathAlias
      ? getNormalizedPath(projectDirectory, info, paths)
      : path.join(info.directory, info.normalized);

    const foundPath = PathFinder.findPath(baseFilePath, info.extension);
    if (foundPath) {
      return toImport({...info, extension: foundPath.extension});
    }
  }
  return null;
}

const ESM_RESOLUTION_OPTIONS: ts.CompilerOptions = {
  allowJs: true,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
};

// Resolves a specifier the way Node.js resolves it from an ES module, which respects "exports" in package.json
function resolvesAsESM(specifier: string, containingFile: string) {
  const {resolvedModule} = ts.resolveModuleName(
    specifier,
    containingFile,
    ESM_RESOLUTION_OPTIONS,
    ts.sys,
    undefined,
    undefined,
    ts.ModuleKind.ESNext
  );
  return !!resolvedModule;
}

// Imports from packages only get an extension when they don't resolve as written but do with the extension.
// This keeps imports of packages with "exports" (i.e. "firebase-functions/v1/https") untouched,
// while legacy packages (i.e. "lodash/omit") become "lodash/omit.js".
// @see https://github.com/bennycode/ts2esm/issues/128
function createPackageImportPath(info: ModuleInfo) {
  if (resolvesAsESM(info.normalized, info.sourceFilePath)) {
    return null;
  }
  for (const extension of ['.js', '/index.js']) {
    if (resolvesAsESM(`${info.normalized}${extension}`, info.sourceFilePath)) {
      return toImport({...info, extension});
    }
  }
  return null;
}
