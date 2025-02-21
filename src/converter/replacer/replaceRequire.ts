import {SourceFile, SyntaxKind, VariableStatement} from 'ts-morph';
import {NodeUtil} from '../../util/NodeUtil.js';
import {replaceModulePath} from './addFileExtensions.js';

function replaceDynamicImport(sourceFile: SourceFile, statement: VariableStatement) {
  let madeChanges: boolean = false;

  statement.getDeclarations().forEach(declaration => {
    const initializer = declaration.getInitializerIfKind(SyntaxKind.AwaitExpression);
    const callExpression = initializer?.getExpressionIfKind(SyntaxKind.CallExpression);
    const importExpression = callExpression?.getExpressionIfKind(SyntaxKind.ImportKeyword);
    if (importExpression) {
      const literals = initializer?.getDescendantsOfKind(SyntaxKind.StringLiteral);
      literals?.forEach(stringLiteral => {
        const adjustedImport = replaceModulePath({
          hasAttributesClause: false,
          sourceFile,
          stringLiteral,
        });
        if (adjustedImport) {
          madeChanges = true;
        }
      });
    }
  });

  return madeChanges;
}

/**
 * Replaces a CommonJS require statement with an ESM import declaration.
 *
 * @param sourceFile - The source file being transformed.
 * @param statement - The candidate containing the require statement.
 * @returns true if the replacement was successful, false otherwise.
 */
function replaceRequire(sourceFile: SourceFile, statement: VariableStatement) {
  // Get the variable declaration
  const declaration = statement.getDeclarations()[0];
  if (!declaration) {
    return false;
  }

  // Get call expression from variable declaration
  // @see https://github.com/dsherret/ts-morph/issues/682#issuecomment-520246214
  const callExpression = declaration.getInitializerIfKind(SyntaxKind.CallExpression);
  if (!callExpression) {
    return false;
  }

  // Verify that we have a "require" call
  const identifier = callExpression.getExpressionIfKind(SyntaxKind.Identifier);
  if (identifier?.getText() !== 'require') {
    return false;
  }

  // Extract the argument passed to "require" and use its value
  const requireArguments = callExpression.getArguments();
  const packageName = requireArguments[0];
  if (!packageName) {
    return false;
  }

  // Narrowing the argument down to its literal value
  const packageNameLiteral = packageName.asKind(SyntaxKind.StringLiteral);
  if (!packageNameLiteral) {
    return false;
  }

  // Add import declaration
  sourceFile.addImportDeclaration({
    defaultImport: declaration.getName(),
    moduleSpecifier: packageNameLiteral.getLiteralValue(),
  });

  // Remove the original "require" statement
  statement.remove();
  return true;
}

export function replaceRequiresAndShebang(sourceFile: SourceFile) {
  let madeChanges: boolean = false;

  // Handle files with "#! /usr/bin/env node" pragma
  const firstStatement = sourceFile.getStatements()[0];
  const hasShebang = firstStatement && firstStatement?.getFullText().startsWith('#!');
  let shebangText = '';
  if (hasShebang) {
    // The full text contains both comments and the following statment,
    // so we are separating the statement into comments and the instruction that follow on the next line.
    const {statement: lineAfterShebang, comment} = NodeUtil.extractComment(firstStatement);
    shebangText = comment;
    // We remove the node containing the shebang comment (and the following statement) to insert only the pure statement.
    const index = firstStatement.getChildIndex();
    firstStatement.remove();
    sourceFile.insertStatements(index, lineAfterShebang);
  }

  // TODO: Traverse statements, make changes, save changes and ONLY after that, proceed with the next statements...
  sourceFile.getVariableStatements().forEach(statement => {
    try {
      const updatedRequire = replaceRequire(sourceFile, statement);
      if (updatedRequire) {
        return (madeChanges = true);
      }

      const updatedDynamicImport = replaceDynamicImport(sourceFile, statement);
      if (updatedDynamicImport) {
        return (madeChanges = true);
      }

      return false;
    } catch (error: unknown) {
      console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
      return false;
    }
  });

  if (shebangText) {
    // We reinsert the Shebang at the top of the file to avoid error TS18026.
    sourceFile.insertStatements(0, shebangText);
  }

  return madeChanges;
}
