import {SourceFile, SyntaxKind} from 'ts-morph';
import {rewrite} from '../main.js';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {replaceModuleExports} from './replaceModuleExports.js';
import {replaceRequires} from './replaceRequire.js';

/**
 * Returns the source file ONLY if it was modified.
 */
export function convertFile(tsConfigFilePath: string, sourceFile: SourceFile) {
  const filePath = sourceFile.getFilePath();
  const project = ProjectUtil.getProject(tsConfigFilePath);
  const paths = ProjectUtil.getPaths(project);
  const projectDirectory = ProjectUtil.getRootDirectory(tsConfigFilePath);

  let madeChanges: boolean = false;

  // Update "require" statements to "import" statements
  const updatedRequires = replaceRequires(sourceFile);
  if (updatedRequires) {
    madeChanges = true;
  }

  // Update "module.exports" statements to "export" statements
  const replacedModuleExports = replaceModuleExports(sourceFile);
  if (replacedModuleExports) {
    madeChanges = true;
  }

  // Add explicit file extensions to imports
  sourceFile.getImportDeclarations().forEach(importDeclaration => {
    importDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
      const hasAttributesClause = !!importDeclaration.getAttributes();
      const adjustedImport = rewrite({
        hasAttributesClause,
        paths,
        projectDirectory,
        sourceFilePath: sourceFile.getFilePath(),
        stringLiteral,
      });
      if (adjustedImport) {
        madeChanges = true;
      }
    });
  });

  // Add explicit file extensions to exports
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
      if (adjustedExport) {
        madeChanges = true;
      }
    });
  });

  return madeChanges ? sourceFile : null;
}
