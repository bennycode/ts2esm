import {SourceFile, SyntaxKind} from 'ts-morph';

export function replaceModuleExports(sourceFile: SourceFile) {
  let defaultExport: string | undefined = undefined;
  const namedExports: string[] = [];

  // Iterate through all statements in the source file
  sourceFile.getStatements().forEach(statement => {
    // Check if the statement is an ExpressionStatement
    if (statement.getKind() === SyntaxKind.ExpressionStatement) {
      const expressionStatement = statement.asKind(SyntaxKind.ExpressionStatement);
      if (!expressionStatement) {
        return;
      }
      const expression = expressionStatement.getExpression();
      if (expression.getKind() === SyntaxKind.BinaryExpression) {
        const binaryExpression = expression.asKind(SyntaxKind.BinaryExpression);
        if (!binaryExpression) {
          return;
        }
        const left = binaryExpression.getLeft().getText();
        const right = binaryExpression.getRight().getText();

        if (left === 'module.exports') {
          // Handle `module.exports = ...` (default export)
          defaultExport = right;
          statement.remove();
        } else if (left.startsWith('module.exports.')) {
          // Handle `module.exports.<name> = ...` (named exports)
          // Get the property name after `module.exports.`
          const exportName = left.split('.')[2];
          if (exportName) {
            namedExports.push(exportName);
            statement.remove();
          }
        }
      }
    }
  });

  // Add default export
  if (defaultExport) {
    sourceFile.addExportAssignment({
      expression: defaultExport,
      isExportEquals: false,
    });
  }

  // Add named export
  namedExports.forEach(name => {
    sourceFile.addExportDeclaration({
      namedExports: [name],
    });
  });

  const madeChanges = namedExports.length || defaultExport;
  return !!madeChanges;
}
