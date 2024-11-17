import {SourceFile, SyntaxKind} from 'ts-morph';
import {rewrite} from '../main.js';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {replaceRequire} from './replaceRequire.js';

/**
 * Returns the source file ONLY if it was modified.
 */
export function convertFile(tsConfigFilePath: string, sourceFile: SourceFile) {
  const filePath = sourceFile.getFilePath();
  const project = ProjectUtil.getProject(tsConfigFilePath);
  const paths = ProjectUtil.getPaths(project);
  const projectDirectory = ProjectUtil.getRootDirectory(tsConfigFilePath);

  let madeChanges: boolean = false;

  // Update "require" variable assignments to "import" declarations
  sourceFile.getVariableStatements().forEach(statement => {
    const updatedRequire = replaceRequire(sourceFile, statement);
    if (updatedRequire) {
      madeChanges = true;
    }
  });

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
