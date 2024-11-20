import {SourceFile, SyntaxKind} from 'ts-morph';
import {NodeUtil} from '../../util/NodeUtil.js';

export function replaceModuleExports(sourceFile: SourceFile) {
  let defaultExport: string | undefined = undefined;
  const namedExports: string[] = [];

  sourceFile.getStatements().forEach(statement => {
    try {
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
          const right = binaryExpression.getRight();

          // Handle `module.exports = <expression>;`
          if (left === 'module.exports') {
            const {comment} = NodeUtil.extractComment(binaryExpression.getLeft());
            defaultExport = right.getText();
            sourceFile.addStatements(`${comment}export default ${defaultExport};`);
            statement.remove();
          } else if (left.startsWith('module.exports.')) {
            // Handle `module.exports.<name> = <value>;`
            const exportName = left.split('.')[2];
            if (exportName) {
              namedExports.push(exportName);
              statement.remove();
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
    }
  });

  try {
    if (namedExports.length > 0) {
      sourceFile.addExportDeclaration({
        namedExports,
      });
    }
  } catch (error: unknown) {
    console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
  }

  const madeChanges = defaultExport !== undefined || namedExports.length > 0;
  return madeChanges;
}
