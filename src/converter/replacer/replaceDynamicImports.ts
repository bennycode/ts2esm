import {SourceFile, SyntaxKind} from 'ts-morph';
import {replaceModulePath} from '../../util/replaceModulePath.js';

export function replaceDynamicImports(sourceFile: SourceFile) {
  let madeChanges: boolean = false;

  sourceFile.getVariableStatements().forEach(statement => {
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
  });

  return madeChanges;
}
