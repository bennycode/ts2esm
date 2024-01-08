import fs from 'node:fs';
import path from 'node:path';
import {Project, type ProjectOptions, StringLiteral, SyntaxKind} from 'ts-morph';
import {toJS, toJSON} from './util.js';
import {type ModuleInfo, parseInfo} from './parseInfo.js';

export function convert(options: ProjectOptions, debugLogging: boolean = false) {
  const project = new Project(options);

  project.getSourceFiles().forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    if (debugLogging) {
      console.log(` Checking: ${filePath}`);
    }

    let madeChanges: boolean = false;

    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      importDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const hasAssertClause = !!importDeclaration.getAssertClause();
        const adjustedImport = rewrite(filePath, stringLiteral, hasAssertClause);
        madeChanges ||= adjustedImport;
      });
    });

    sourceFile.getExportDeclarations().forEach(exportDeclaration => {
      exportDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const adjustedExport = rewrite(filePath, stringLiteral);
        madeChanges ||= adjustedExport;
      });
    });

    if (madeChanges) {
      sourceFile.saveSync();
      console.log(`  Modified (🔧): ${filePath}`);
    }
  });
}

function rewrite(sourceFilePath: string, stringLiteral: StringLiteral, hasAssertClause: boolean = false) {
  const info = parseInfo(sourceFilePath, stringLiteral);
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
    // If an import does not have a file extension, try to find a matching file by traversing through all valid
    // TypeScript source file extensions.
    if (info.extension === '') {
      for (const replacement of [
        {newExtension: '.cjs', candidate: '.cts'},
        {newExtension: '.js', candidate: '.js'},
        {newExtension: '.js', candidate: '.jsx'},
        {newExtension: '.js', candidate: '.ts'},
        {newExtension: '.js', candidate: '.tsx'},
        {newExtension: '.mjs', candidate: '.mts'},
        {newExtension: '/index.cjs', candidate: '/index.cts'},
        {newExtension: '/index.js', candidate: '/index.js'},
        {newExtension: '/index.js', candidate: '/index.jsx'},
        {newExtension: '/index.js', candidate: '/index.ts'},
        {newExtension: '/index.js', candidate: '/index.tsx'},
        {newExtension: '/index.mjs', candidate: '/index.mts'},
      ]) {
        // If a valid file has been found, create a fully-specified path (including the file extension) for it.
        const fileCandidate = path.join(info.directory, `${info.normalized}${replacement.candidate}`);
        if (fs.existsSync(fileCandidate)) {
          return toJS(info, replacement.newExtension);
        }
      }
    } else if (info.extension === '.json') {
      return toJSON(info);
    }
  }
  return null;
}
