import {SourceFile, SyntaxKind, VariableStatement} from 'ts-morph';

export function replaceRequire(sourceFile: SourceFile, statement: VariableStatement) {
  // Check if the initializer is a require call
  const declaration = statement.getDeclarations()[0];
  if (!declaration) {
    return false;
  }

  // @see https://github.com/dsherret/ts-morph/issues/682#issuecomment-520246214
  const initializer = declaration.getInitializerIfKind(SyntaxKind.CallExpression);
  if (!initializer) {
    return false;
  }

  // Extract the argument passed to "require()" and use its value
  const args = initializer.getArguments();
  const moduleSpecifierNode = args[0];
  if (!moduleSpecifierNode) {
    return false;
  }

  // Narrowing the Node and accessing its literal value
  const moduleName = moduleSpecifierNode.asKind(SyntaxKind.StringLiteral)?.getLiteralValue();
  if (!moduleName) {
    return false;
  }

  // Add import declaration
  sourceFile.addImportDeclaration({
    defaultImport: declaration.getName(),
    moduleSpecifier: moduleName,
  });

  // Remove the original require statement
  statement.remove();
  return true;
}
