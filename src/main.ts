import path from 'node:path';
import {Project, StringLiteral, SyntaxKind} from 'ts-morph';
import {applyModification} from './codemod/applyModification.js';
import {convertTSConfig} from './codemod/modifyTSConfig.js';
import {toImport, toImportAttribute} from './converter/ImportConverter.js';
import {parseInfo, type ModuleInfo} from './parser/InfoParser.js';
import {PathFinder} from './util/PathFinder.js';
import {getNormalizedPath} from './util/PathUtil.js';

/**
 * Traverses all source code files from a project and checks its import and export declarations.
 */
export async function convert(tsConfigFilePath: string, debugLogging: boolean = false) {
  const project = new Project({
    // Limit the scope of source files to those directly listed as opposed to also all
    // of the dependencies that may be imported. Never want to modify dependencies.
    skipFileDependencyResolution: true,

    tsConfigFilePath,
  });
  const projectDirectory = project.getRootDirectories()[0]?.getPath() || '';
  // Note: getCompilerOptions() cannot be cached and has to be used everytime the config is accessed
  const paths = project.getCompilerOptions().paths;

  // Check "module" and "moduleResolution" in "tsconfig.json"
  await convertTSConfig(tsConfigFilePath, project);

  // Add "type": "module" to "package.json"
  const packageJsonPath = path.join(projectDirectory, 'package.json');
  await applyModification(packageJsonPath, 'type', 'module');

  if (paths && debugLogging) {
    console.log('Found path aliases (🧪):', paths);
  }

  project.getSourceFiles().forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    if (debugLogging) {
      console.log(` Checking (🧪): ${filePath}`);
    }

    let madeChanges: boolean = false;

    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      importDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const hasAttributesClause = !!importDeclaration.getAttributes();
        const adjustedImport = rewrite({
          hasAttributesClause,
          paths,
          projectDirectory,
          sourceFilePath: filePath,
          stringLiteral,
        });
        madeChanges ||= adjustedImport;
      });
    });

    sourceFile.getExportDeclarations().forEach(exportDeclaration => {
      exportDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const hasAttributesClause = !!exportDeclaration.getAttributes();
        const adjustedExport = rewrite({
          hasAttributesClause,
          paths,
          projectDirectory,
          sourceFilePath: filePath,
          stringLiteral,
        });
        madeChanges ||= adjustedExport;
      });
    });

    if (madeChanges) {
      sourceFile.saveSync();
      console.log(`  Modified (🔧): ${filePath}`);
    }
  });
}

function rewrite({
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
      return toImport({...info, extension: foundPath.extension});
    }
  }
  return null;
}
