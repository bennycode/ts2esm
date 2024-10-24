import {Project, SourceFile, SyntaxKind} from 'ts-morph';
import {rewrite} from '../main.js';
import {ProjectUtil} from '../util/ProjectUtil.js';

export function convertFile(project: Project, sourceFile: SourceFile, dryRun: boolean) {
  const filePath = sourceFile.getFilePath();
  const paths = ProjectUtil.getPaths(project);
  const projectDirectory = ProjectUtil.getRootDirectory(project);

  let madeChanges: boolean = false;

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
