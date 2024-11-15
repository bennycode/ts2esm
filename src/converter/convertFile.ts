import {SourceFile, SyntaxKind} from 'ts-morph';
import {rewrite} from '../main.js';
import {ProjectUtil} from '../util/ProjectUtil.js';

export function convertFile(tsConfigFilePath: string, sourceFile: SourceFile, dryRun: boolean) {
  const filePath = sourceFile.getFilePath();
  const project = ProjectUtil.getProject(tsConfigFilePath);
  const paths = ProjectUtil.getPaths(project);
  const projectDirectory = ProjectUtil.getRootDirectory(tsConfigFilePath);

  let madeChanges: boolean = false;

  // Update "require" to "import"
  sourceFile.getVariableStatements().forEach(statement => {
    // Check if the initializer is a require call
    const declaration = statement.getDeclarations()[0];
    if (!declaration) {
      return;
    }

    // @see https://github.com/dsherret/ts-morph/issues/682#issuecomment-520246214
    const initializer = declaration.getInitializerIfKind(SyntaxKind.CallExpression);
    if (!initializer) {
      return;
    }

    // Extract the argument passed to "require()" and use its value
    const args = initializer.getArguments();
    const moduleSpecifierNode = args[0];
    if (!moduleSpecifierNode) {
      return;
    }

    // Narrowing the Node and accessing its literal value
    const moduleName = moduleSpecifierNode.asKind(SyntaxKind.StringLiteral)?.getLiteralValue();
    if (!moduleName) {
      return;
    }

    // Add import declaration
    sourceFile.addImportDeclaration({
      defaultImport: declaration.getName(),
      moduleSpecifier: moduleName,
    });

    // Remove the original require statement
    statement.remove();
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
