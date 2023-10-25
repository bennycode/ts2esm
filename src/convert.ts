import fs from 'node:fs';
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

export function toESM(importPath: string, quoteSymbol: string, index: boolean = false) {
  const indexNotiation = index ? '/index' : '';
  return `${importPath.replace(new RegExp(`${quoteSymbol}$`), `${indexNotiation}.js${quoteSymbol}`)}`;
}

export function convert(options: ProjectOptions) {
  const project = new Project(options);

  project.getSourceFiles().forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    console.log(`Checking: ${filePath}`);
    let madeChanges: boolean = false;
    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      importDeclaration.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(stringLiteral => {
        const importPath = stringLiteral.getText();
        const quoteSymbol = stringLiteral.getQuoteKind().toString();
        if (hasRelativeImport(importPath, quoteSymbol)) {
          const directory = path.dirname(filePath);
          const potentialFile = importPath.replaceAll(quoteSymbol, '');
          const directFilePath = path.join(directory, potentialFile + '.ts');
          const indexFilePath = path.join(directory, potentialFile + '/index.ts');

          let newImport = '';

          /** @see https://github.com/bennycode/ts2esm/issues/4 */
          if (fs.existsSync(directFilePath)) {
            newImport = toESM(stringLiteral.getText(), quoteSymbol, false);
            stringLiteral.replaceWithText(newImport);
          } else if (fs.existsSync(indexFilePath)) {
            newImport = toESM(stringLiteral.getText(), quoteSymbol, true);
          }

          if (newImport.length > 0) {
            stringLiteral.replaceWithText(newImport);
          }
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
