import path from 'node:path';
import {Project, type ProjectOptions} from 'ts-morph';
import {SyntaxKind} from 'typescript';

export function convert(options: ProjectOptions) {
  const project = new Project(options);

  project.getSourceFiles().forEach(sourceFile => {
    console.log(`Checking: ${sourceFile.getFilePath()}`);
    let madeChanges: boolean = false;
    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      importDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const importPath = stringLiteral.getText();
        const quoteSymbol = stringLiteral.getQuoteKind().toString();
        // Match patterns like: './UserAPI' or "./UserAPI"
        if (importPath.startsWith(`${quoteSymbol}./`) || importPath.startsWith(`${quoteSymbol}../`)) {
          const extension = path.extname(importPath);
          const hasNoExtension = extension.length === 0;
          // Filter files like: '../test/fixtures.json'
          if (hasNoExtension) {
            const newImport = `${stringLiteral.getText().replace(new RegExp(`${quoteSymbol}$`), `.js${quoteSymbol}`)}`;
            stringLiteral.replaceWithText(newImport);
            madeChanges = true;
          }
        }
      });
    });
    if (madeChanges) {
      sourceFile.saveSync();
      console.log(`Modified (🔧): ${sourceFile.getFilePath()}`);
    }
  });
}
