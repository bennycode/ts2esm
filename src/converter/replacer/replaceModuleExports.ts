import {SourceFile, SyntaxKind} from 'ts-morph';
import {NodeUtil} from '../../util/NodeUtil.js';

// module.exports = Benny
// Binary Expression > PropertyAccessExpression + Identifier

// module.exports = function some()
// Binary Expression > PropertyAccessExpression + FunctionExpression

export function replaceModuleExports(sourceFile: SourceFile) {
  let foundDefaultExport: boolean = false;
  let foundNamedExport: boolean = false;

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
      const isExportingObjectLiteral = right.getKind() === SyntaxKind.ObjectLiteralExpression;

      const {comment} = NodeUtil.extractComment(left);

      switch (true) {
        case isDefaultExport: {
          foundDefaultExport = true;
          const position = expressionStatement.getChildIndex();

          if (isExportingIdentifier) {
            sourceFile.insertExportAssignment(position, {
              expression: rightText,
              isExportEquals: false,
            });
          } else if (isExportingFunction) {
            // @see https://github.com/dsherret/ts-morph/issues/1586
            sourceFile.insertStatements(position, `${comment}export default ${rightText};`);
          } else if (isExportingObjectLiteral) {
            // Handle object literal expressions like module.exports = { c0, c1 }
            foundNamedExport = true;
            const objectLiteral = right.asKind(SyntaxKind.ObjectLiteralExpression);
            if (objectLiteral) {
              const exportNames: string[] = [];
              const properties = objectLiteral.getProperties();
              
              for (const property of properties) {
                if (property.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
                  // For shorthand properties like { c0, c1 }, export the name directly
                  const shorthandProperty = property.asKind(SyntaxKind.ShorthandPropertyAssignment);
                  if (shorthandProperty) {
                    const name = shorthandProperty.getName();
                    exportNames.push(name);
                  }
                } else if (property.getKind() === SyntaxKind.PropertyAssignment) {
                  // For regular properties like { a: c0, b: c1 }, export with alias
                  const propAssignment = property.asKind(SyntaxKind.PropertyAssignment);
                  if (propAssignment) {
                    const name = propAssignment.getName();
                    const initializer = propAssignment.getInitializer();
                    if (initializer && initializer.getKind() === SyntaxKind.Identifier) {
                      const identifier = initializer.getText();
                      exportNames.push(`${identifier} as ${name}`);
                    }
                  }
                }
              }
              
              if (exportNames.length > 0) {
                sourceFile.insertExportDeclaration(position, {
                  namedExports: exportNames,
                });
              }
            }
          }

          expressionStatement.remove();
          break;
        }
        case isNamedExport: {
          foundNamedExport = true;
          const position = expressionStatement.getChildIndex();
          sourceFile.insertExportDeclaration(position, {
            namedExports: [rightText],
          });
          expressionStatement.remove();
          break;
        }
      }
    } catch (error: unknown) {
      console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
    }
  });

  const madeChanges = foundDefaultExport || foundNamedExport;
  return madeChanges;
}
