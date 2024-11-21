import {SourceFile, SyntaxKind} from 'ts-morph';
import {NodeUtil} from '../../util/NodeUtil.js';

// module.exports = Benny
// Binary Expression > PropertyAccessExpression + Identifier

// module.exports = function some()
// Binary Expression > PropertyAccessExpression + FunctionExpression

export function replaceModuleExports(sourceFile: SourceFile) {
  let defaultExport: string | undefined = undefined;
  let namedExportPosition: number | undefined = undefined;
  const namedExports: string[] = [];

  sourceFile.getStatements().forEach(statement => {
    try {
      const expressionStatement = statement.asKind(SyntaxKind.ExpressionStatement);
      if (!expressionStatement) {
        return;
      }

      const binaryExpression = expressionStatement.getExpression().asKind(SyntaxKind.BinaryExpression);
      if (!binaryExpression) {
        return;
      }

      const left = binaryExpression.getLeft().asKind(SyntaxKind.PropertyAccessExpression);
      if (!left) {
        return;
      }

      const right = binaryExpression.getRight();
      const leftText = left.getText();
      const rightText = right.getText();

      const isDefaultExport = leftText === 'module.exports';
      const isNamedExport = leftText.startsWith('module.exports.');
      const isExportingFunction = right.getKind() === SyntaxKind.FunctionExpression;
      const isExportingIdentifier = right.getKind() === SyntaxKind.Identifier;

      const {comment} = NodeUtil.extractComment(left);

      switch (true) {
        case isDefaultExport: {
          const position = expressionStatement.getChildIndex();
          defaultExport = rightText;

          if (isExportingIdentifier) {
            sourceFile.insertExportAssignment(position, {
              isExportEquals: false,
              expression: rightText,
            });
          } else if (isExportingFunction) {
            sourceFile.insertStatements(position, `${comment}export default ${defaultExport};`);
          }

          expressionStatement.remove();
          break;
        }
        case isNamedExport && isExportingIdentifier: {
          namedExportPosition ||= expressionStatement.getChildIndex();
          namedExports.push(rightText);
          expressionStatement.remove();
          break;
        }
      }
    } catch (error: unknown) {
      console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
    }
  });

  try {
    if (namedExports.length > 0 && namedExportPosition) {
      sourceFile.insertExportDeclaration(namedExportPosition, {
        namedExports,
      });
    }
  } catch (error: unknown) {
    console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
  }

  const madeChanges = defaultExport !== undefined || namedExports.length > 0;
  return madeChanges;
}
