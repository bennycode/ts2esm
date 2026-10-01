import {Expression, Identifier, SourceFile, Statement, SyntaxKind, ts} from 'ts-morph';
import {NodeUtil} from '../../util/NodeUtil.js';

/*
 * module.exports = Benny
 * Binary Expression > PropertyAccessExpression + Identifier
 */

/*
 * module.exports = function some()
 * Binary Expression > PropertyAccessExpression + FunctionExpression
 */

/*
 * module.exports = { a, b: c } -> ["a", "c as b"]
 * Returns undefined when a property is not a plain identifier reference (e.g. { a: 1 }),
 * because named exports can only re-export existing bindings.
 */
function getNamedExports(expression: Expression) {
  const objectLiteral = expression.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!objectLiteral) {
    return undefined;
  }

  const namedExports: string[] = [];
  for (const property of objectLiteral.getProperties()) {
    const shorthand = property.asKind(SyntaxKind.ShorthandPropertyAssignment);
    const assignment = property.asKind(SyntaxKind.PropertyAssignment);
    const identifier = assignment?.getInitializer()?.asKind(SyntaxKind.Identifier);

    if (shorthand) {
      namedExports.push(shorthand.getName());
    } else if (assignment && identifier && assignment.getNameNode().isKind(SyntaxKind.Identifier)) {
      const name = assignment.getName();
      const local = identifier.getText();
      namedExports.push(name === local ? name : `${local} as ${name}`);
    } else {
      return undefined;
    }
  }
  return namedExports.length > 0 ? namedExports : undefined;
}

// Names that cannot be declared as a variable in an ES module (strict mode)
const STRICT_MODE_RESERVED = new Set(['arguments', 'await', 'eval']);

function isReservedWord(identifier: Identifier) {
  const kind = ts.identifierToKeywordKind(identifier.compilerNode);
  const isKeyword =
    kind !== undefined && kind >= SyntaxKind.FirstReservedWord && kind <= SyntaxKind.LastFutureReservedWord;
  return isKeyword || STRICT_MODE_RESERVED.has(identifier.getText());
}

/*
 * Returns the export name if it can be declared as a module-level const, otherwise a free alias like "_name".
 * ponytail: treats any identifier with the same text elsewhere in the file as taken (no scope analysis),
 * so some exports get an alias they don't strictly need. The output stays valid either way.
 */
function getLocalName(sourceFile: SourceFile, statement: Statement, identifier: Identifier) {
  const name = identifier.getText();
  const usedNames = new Set(
    sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter(node => !statement.containsRange(node.getPos(), node.getEnd()))
      .map(node => node.getText())
  );

  if (!isReservedWord(identifier) && !usedNames.has(name)) {
    return name;
  }

  let local = `_${name}`;
  for (let suffix = 2; usedNames.has(local); suffix++) {
    local = `_${name}${suffix}`;
  }
  return local;
}

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
      // Only `module.exports.foo`, not deeper paths like `module.exports.foo.bar`
      const isNamedExport = left.getExpression().getText() === 'module.exports';
      const isExportingIdentifier = right.getKind() === SyntaxKind.Identifier;
      const namedExports = getNamedExports(right);

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
          } else if (namedExports) {
            sourceFile.insertExportDeclaration(position, {namedExports});
          } else {
            /*
             * Any other expression becomes a default export, so no code gets dropped
             * @see https://github.com/dsherret/ts-morph/issues/1586
             */
            sourceFile.insertStatements(position, `${comment}export default ${rightText};`);
          }

          expressionStatement.remove();
          break;
        }
        case isNamedExport: {
          foundNamedExport = true;
          const position = expressionStatement.getChildIndex();
          const name = left.getName();

          if (isExportingIdentifier) {
            sourceFile.insertExportDeclaration(position, {
              namedExports: [name === rightText ? name : `${rightText} as ${name}`],
            });
          } else {
            const local = getLocalName(sourceFile, expressionStatement, left.getNameNode());
            sourceFile.insertStatements(
              position,
              local === name
                ? `export const ${name} = ${rightText};`
                : `const ${local} = ${rightText};\nexport { ${local} as ${name} };`
            );
          }
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
