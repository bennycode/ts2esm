import {SourceFile, SyntaxKind} from 'ts-morph';
import {rewrite} from '../main.js';
import {ProjectUtil} from '../util/ProjectUtil.js';
import {replaceRequire} from './replaceRequire.js';

export function convertFile(tsConfigFilePath: string, sourceFile: SourceFile, dryRun: boolean) {
  const filePath = sourceFile.getFilePath();
  const project = ProjectUtil.getProject(tsConfigFilePath);
  const paths = ProjectUtil.getPaths(project);
  const projectDirectory = ProjectUtil.getRootDirectory(tsConfigFilePath);

  let madeChanges: boolean = false;

  // Update "require" to "import"
  sourceFile.getVariableStatements().forEach(statement => {
    madeChanges ||= replaceRequire(sourceFile, statement);
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
      madeChanges ||= adjustedImport;
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
      madeChanges ||= adjustedExport;
    });
  });

  if (madeChanges) {
    if (!dryRun) {
      sourceFile.saveSync();
      console.log(`  Modified (🔧): ${filePath}`);
    }
  }

  return sourceFile;
}
