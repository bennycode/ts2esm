# ts2esm

Converts your TypeScript import & export declarations into ESM-compatible declarations. 🪄

## Guide

Convert your CommonJS TypeScript project into an ECMAScript module with these simple steps:

1. Add `"type": "module"` in your `package.json`
2. Set [module](https://www.typescriptlang.org/tsconfig#module) to `"nodenext"` in your `tsconfig.json`
3. Set [moduleResolution](https://www.typescriptlang.org/tsconfig#moduleResolution) to `"nodenext"` in your `tsconfig.json`
4. Run `ts2esm` in the directory of your TypeScript project

> [!IMPORTANT]  
> Use TypeScript 5.2 or later as there have been [breaking changes to the Node.js settings](https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/#breaking-changes-and-correctness-fixes), which you don't want to miss.

## Examples

### Imports

Turns:

```ts
import {AccountAPI} from '../account';
import {RESTClient} from './client/RESTClient';
```

Into:

```ts
import {AccountAPI} from '../account/index.js';
import {RESTClient} from './client/RESTClient.js';
```

### Exports

Turns:

```ts
export * from './account';
export * from './UserAPI';
```

Into:

```ts
export * from './account/index.js';
export * from './UserAPI.js';
```

### JSON Import Assertions

Turns:

```ts
import listAccounts from '../test/fixtures/listAccounts.json';
```

Into:

```ts
import listAccounts from '../test/fixtures/listAccounts.json' assert {type: 'json'};
```

## Installation

Simply run this command to install `ts2esm` globally on your machine:

```bash
npm i -g ts2esm
```

Afterwards, just launch the program inside the directory of your TS project (it will ask you for your `tsconfig.json`):

```bash
ts2esm
```

You can also enable verbose logging with:

```bash
ts2esm --debug
```

> [!WARNING]  
> Make sure you have a backup (in Git or similar) of your code as this program will modify your source code.

## How it works

The `ts2esm` program adjusts your relative imports, adding extensions like `index.js` or `.js` to make them ESM-compatible. Say goodbye to import errors such as **TS2834** or [**TS2835**](https://typescript.tv/errors/#ts2835)!

Errors that get automatically fixed (🛠️):

> TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module needs an import assertion of type "json"

> error TS2834: Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Consider adding an extension to the import path.

> error TS2835: Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'.

## Credits

This program was born from an [inspiring conversation](https://twitter.com/bennycode/status/1693362836695585084) I had with [Basarat Ali Syed](https://twitter.com/basarat). I recommend checking out [Basarat's coding tutorials](https://www.youtube.com/@basarat). 👍

## References

- [TypeScript's Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution-is-host-defined)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/)
- [Are the types wrong?](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
