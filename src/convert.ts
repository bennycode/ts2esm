import fs from 'node:fs';
import path from 'node:path';
import { Project, StringLiteral, SyntaxKind, type ProjectOptions } from 'ts-morph';
import { parseInfo, type ModuleInfo } from './parseInfo.js';
import { toImport, toImportAssertion } from './util.js';

export function convert(options: ProjectOptions, debugLogging: boolean = false) {
  const project = new Project(options);

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
        const hasAssertClause = !!importDeclaration.getAssertClause();
        const adjustedImport = rewrite(filePath, stringLiteral, hasAssertClause, paths);
        madeChanges ||= adjustedImport;
      });
    });

    sourceFile.getExportDeclarations().forEach(exportDeclaration => {
      exportDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const adjustedExport = rewrite(filePath, stringLiteral, false, undefined);
        madeChanges ||= adjustedExport;
      });
    });

    if (madeChanges) {
      sourceFile.saveSync();
      console.log(`  Modified (🔧): ${filePath}`);
    }
  });
}

function rewrite(sourceFilePath: string, stringLiteral: StringLiteral, hasAssertClause: boolean, paths: Record<string, string[]> | undefined) {
  const info = parseInfo(sourceFilePath, stringLiteral, paths);
  const replacement = createReplacementPath(info, hasAssertClause);
  if (replacement) {
    stringLiteral.replaceWithText(replacement);
    return true;
  }
  return false;
}

function createReplacementPath(info: ModuleInfo, hasAssertClause: boolean) {
  if (hasAssertClause) {
    return null;
  }

  if (info.isRelative) {
    if (info.extension === '.json' || info.extension === '.css') {
      return toImportAssertion(info);
    }

    // If an import does not have a file extension or isn't an extension recognized here and can't be found locally (perhaps
    // file had . in name), try to find a matching file by traversing through all valid TypeScript source file extensions.
    const baseFilePath = path.join(info.directory, info.normalized);
    if (info.extension === '' || (!['.js', '.cjs', '.mjs'].includes(info.extension) && !fs.existsSync(baseFilePath))) {
      for (const bareOrIndex of ['', '/index']) {
        for (const replacement of [
          // Sorted by expected most common to least common for performance.
          {candidate: '.ts', newExtension: '.js'},
          {candidate: '.tsx', newExtension: '.js'},
          {candidate: '.js', newExtension: '.js'},
          {candidate: '.jsx', newExtension: '.js'},
          {candidate: '.cts', newExtension: '.cjs'},
          {candidate: '.mts', newExtension: '.mjs'},
          {candidate: '.cjs', newExtension: '.cjs'},
          {candidate: '.mjs', newExtension: '.mjs'},
        ]) {
          // If a valid file has been found, create a fully-specified path (including the file extension) for it.
          const fileCandidate = `${baseFilePath}${bareOrIndex}${replacement.candidate}`;
          if (fs.existsSync(fileCandidate)) {
            return toImport({...info, extension: `${bareOrIndex}${replacement.newExtension}`});
          }
        }
      }
    }
  }
  return null;
}
