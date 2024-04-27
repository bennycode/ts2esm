import fs from 'node:fs';
import path from 'node:path';
import {Project, StringLiteral, SyntaxKind, type ProjectOptions} from 'ts-morph';
import {toImport, toImportAttribute} from './converter/ImportConverter.js';
import {parseInfo, type ModuleInfo} from './parser/InfoParser.js';
import {getNormalizedPath} from './util/PathUtil.js';

/**
 * Traverses all source code files from a project and checks its import and export declarations.
 */
export function convert(options: ProjectOptions, debugLogging: boolean = false) {
  const project = new Project(options);
  const projectDirectory = project.getRootDirectories()[0]?.getPath() || '';
  const paths = project.getCompilerOptions().paths;

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

  if (info.isRelative || comesFromPathAlias) {
    if (['.json', '.css'].includes(info.extension)) {
      return toImportAttribute(info);
    }

    // If an import does not have a file extension or isn't an extension recognized here and can't be found locally (perhaps
    // file had . in name), try to find a matching file by traversing through all valid TypeScript source file extensions.
    const baseFilePath = comesFromPathAlias
      ? getNormalizedPath(projectDirectory, info, paths)
      : path.join(info.directory, info.normalized);

    const hasNoJSExtension = !['.js', '.cjs', '.mjs'].includes(info.extension);
    if (info.extension === '' || (hasNoJSExtension && !fs.existsSync(baseFilePath))) {
      for (const bareOrIndex of ['', '/index']) {
        for (const extension of [
          // Sorted by expected most common to least common for performance.
          {new: '.js', candidate: '.ts'},
          {new: '.js', candidate: '.tsx'},
          {new: '.js', candidate: '.js'},
          {new: '.js', candidate: '.jsx'},
          {new: '.cjs', candidate: '.cts'},
          {new: '.mjs', candidate: '.mts'},
          {new: '.cjs', candidate: '.cjs'},
          {new: '.mjs', candidate: '.mjs'},
        ]) {
          const fileCandidate = `${baseFilePath}${bareOrIndex}${extension.old}`;
          // If a valid file has been found, create a fully-specified path (including the file extension) for it.
          if (fs.existsSync(fileCandidate)) {
            return toImport({...info, extension: `${bareOrIndex}${extension.new}`});
          }
        }
      }
    }
  }
  return null;
}
