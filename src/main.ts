import path from 'node:path';
import {StringLiteral} from 'ts-morph';
import {applyModification} from './codemod/applyModification.js';
import {convertTSConfig} from './codemod/convertTSConfig.js';
import {convertFile} from './converter/convertFile.js';
import {toImport, toImportAttribute} from './converter/ImportConverter.js';
import {parseInfo, type ModuleInfo} from './parser/InfoParser.js';
import {PathFinder} from './util/PathFinder.js';
import {getNormalizedPath, isNodeModuleRoot} from './util/PathUtil.js';
import {ProjectUtil} from './util/ProjectUtil.js';

/**
 * Traverses all source code files from a project and checks its import and export declarations.
 */
export async function convert(tsConfigFilePath: string, debugLogging: boolean = false) {
  let checkedFiles = 0;
  let modifiedFiles = 0;

  const project = ProjectUtil.getProject(tsConfigFilePath);
  const paths = ProjectUtil.getPaths(project);

  // Check "module" and "moduleResolution" in "tsconfig.json"
  await convertTSConfig(tsConfigFilePath, project);

  // Add "type": "module" to "package.json"
  const packageJsonPath = path.join(ProjectUtil.getRootDirectory(tsConfigFilePath), 'package.json');
  await applyModification(packageJsonPath, '/type', 'module');

  if (paths && debugLogging) {
    console.log('Found path aliases (🧪):', paths);
  }

  project.getSourceFiles().forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    checkedFiles += 1;
    if (debugLogging) {
      console.log(` Checking (🧪): ${filePath}`);
    }
    const modifiedFile = convertFile(tsConfigFilePath, sourceFile);
    if (modifiedFile) {
      modifiedFiles += 1;
      modifiedFile.saveSync();
      console.log(`  Modified (🔧): ${filePath}`);
    }
  });

  console.log(` Checked "${checkedFiles}" files / Modified "${modifiedFiles}" files ✨`);
}

export function rewrite({
  hasAttributesClause,
  paths,
  projectDirectory,
  sourceFilePath,
  stringLiteral,
}: {
  hasAttributesClause: boolean;
  paths: Record<string, string[]> | undefined;
  projectDirectory: string;
  sourceFilePath: string;
  stringLiteral: StringLiteral;
}) {
  const info = parseInfo(sourceFilePath, stringLiteral, paths);
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

    // If an import does not have a file extension or isn't an extension recognized here and can't be found locally (perhaps
    // file had . in name), try to find a matching file by traversing through all valid TypeScript source file extensions.
    let baseFilePath = comesFromPathAlias
      ? getNormalizedPath(projectDirectory, info, paths)
      : path.join(info.directory, info.normalized);
    if (isNodeModulesPath) {
      baseFilePath = path.join(projectDirectory, 'node_modules', info.normalized);
    }

    const foundPath = PathFinder.findPath(baseFilePath, info.extension);
    if (foundPath) {
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
