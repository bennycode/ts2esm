import {SourceFile, SyntaxKind} from 'ts-morph';
import {replaceModulePath} from '../../util/replaceModulePath.js';

export function addFileExtensions(sourceFile: SourceFile, type: 'import' | 'export') {
  let madeChanges: boolean = false;
  const identifier = type === 'import' ? 'getImportDeclarations' : 'getExportDeclarations';

  sourceFile[identifier]().forEach(declaration => {
    try {
      declaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const hasAttributesClause = !!declaration.getAttributes();
        const adjustedImport = replaceModulePath({
          hasAttributesClause,
          sourceFile,
          stringLiteral,
        });
        if (adjustedImport) {
          madeChanges = true;
        }
      });
    } catch (error: unknown) {
      console.error(` There was an issue with "${sourceFile.getFilePath()}":`, error);
    }
  });

  return madeChanges;
}
