import path from 'node:path';
import {Project, type ProjectOptions} from 'ts-morph';
import typescript from 'typescript';
const {SyntaxKind} = typescript;

export function hasRelativeImport(importPath: string, quoteSymbol: string) {
  const hasRelativeImport = importPath.startsWith(`${quoteSymbol}./`) || importPath.startsWith(`${quoteSymbol}../`);
  const extension = path.extname(importPath);
  const hasNoExtension = extension.length === 0;
  return hasRelativeImport && hasNoExtension;
}

export function toESM(importPath: string, quoteSymbol: string) {
  return `${importPath.replace(new RegExp(`${quoteSymbol}$`), `.js${quoteSymbol}`)}`;
}

export function convert(options: ProjectOptions) {
  const project = new Project(options);

  project.getSourceFiles().forEach(sourceFile => {
    console.log(`Checking: ${sourceFile.getFilePath()}`);
    let madeChanges: boolean = false;
    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      importDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const importPath = stringLiteral.getText();
        const quoteSymbol = stringLiteral.getQuoteKind().toString();
        if (hasRelativeImport(importPath, quoteSymbol)) {
          const newImport = toESM(stringLiteral.getText(), quoteSymbol);
          stringLiteral.replaceWithText(newImport);
          madeChanges = true;
        }
      });
    });
    if (madeChanges) {
      sourceFile.saveSync();
      console.log(`Modified (🔧): ${sourceFile.getFilePath()}`);
    }
  });
}
