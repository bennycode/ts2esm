import {SourceFile, SyntaxKind, VariableStatement} from 'ts-morph';

function replaceRequire(sourceFile: SourceFile, statement: VariableStatement) {
  // Get variable declaration
  const declaration = statement.getDeclarations()[0];
  if (!declaration) {
    return false;
  }

  // Get call expression from variable declaration
  // @see https://github.com/dsherret/ts-morph/issues/682#issuecomment-520246214
  const initializer = declaration.getInitializerIfKind(SyntaxKind.CallExpression);
  if (!initializer) {
    return false;
  }

  // Verify that we have a "require" call
  const identifier = initializer.getExpression().asKind(SyntaxKind.Identifier);
  if (identifier?.getText() !== 'require') {
    return false;
  }

  // Extract the argument passed to "require" and use its value
  const requireArguments = initializer.getArguments();
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

export function replaceRequires(sourceFile: SourceFile) {
  let madeChanges: boolean = false;

  sourceFile.getVariableStatements().forEach(statement => {
    try {
      const updatedRequire = replaceRequire(sourceFile, statement);
      if (updatedRequire) {
        madeChanges = true;
      }
    } catch (error: unknown) {
      console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
    }
  });

  return madeChanges;
}
