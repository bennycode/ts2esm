import {Project, SourceFile, SyntaxKind} from 'ts-morph';
import {rewrite} from '../main.js';

export function convertFile(project: Project, sourceFile: SourceFile, dryRun: boolean) {
  const projectDirectory = project.getRootDirectories()[0]?.getPath() || '';

  // Note: getCompilerOptions() cannot be cached and has to be used everytime the config is accessed
  const paths = project.getCompilerOptions().paths;

  const filePath = sourceFile.getFilePath();

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
