import fs from 'node:fs';
import path from 'node:path';
import {Project, type ProjectOptions, StringLiteral, SyntaxKind} from 'ts-morph';
import {toIndex, toJS, toJSON} from './util.js';
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
    if (info.extension === '') {
      for (const replacement of [
        {suffix: '.ts', toFn: toJS},
        {suffix: '.tsx', toFn: toJS},
        {suffix: '/index.ts', toFn: toIndex},
      ]) {
        if (fs.existsSync(path.join(info.directory, info.normalized + replacement.suffix))) {
          return replacement.toFn(info);
        }
      }
    } else if (info.extension === '.json') {
      return toJSON(info);
    }
  }
  return null;
}
