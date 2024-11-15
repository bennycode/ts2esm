# ts2esm

You want to transform your TypeScript project into an ECMAScript module (ESM)? Look no further! This tool (`ts2esm`) converts your import and export declarations into ESM-compatible ones. It's the ideal tool for converting a CommonJS project to ESM. It also [works with plain JavaScript](https://github.com/bennycode/ts2esm/issues/20#issuecomment-1894702085) projects! 🪄

## Installation

Simply run this command to install `ts2esm` globally on your machine:

```bash
npm i -g ts2esm
```

You can also run it locally (without being globally installed):

```bash
npx ts2esm
```

## Usage

Convert your CommonJS projects (TypeScript or JavaScript) into ECMAScript modules with a single command. Just launch the program inside the directory of your project (it will ask you for your `tsconfig.json` path):

```bash
ts2esm
```

You can also provide a list of tsconfigs (no prompt):

```bash
ts2esm packages/foo/tsconfig.json packages/bar/tsconfig.json
```

Note: The path can be specified absolutely (i.e. `/home/user/cornerstone3D/tsconfig.json`) or relative (i.e. `../../cornerstone3D/tsconfig.json`).

There is also a debug mode with verbose logging:

```bash
ts2esm --debug
```

> [!WARNING]  
> Make sure you have a backup (in Git or similar) of your code as "ts2esm" will modify your source code.

> [!IMPORTANT]  
> Use TypeScript 5.2 or later as there have been [breaking changes to the Node.js settings](https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/#breaking-changes-and-correctness-fixes), which you don't want to miss.

> [!IMPORTANT]  
> Since TypeScript 5.3 import assertions are [replaced with import attributes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-3-beta/#import-attributes).

## Step-by-Step Guide

This workflow migrates a CommonJS project and checks its types:

```bash
# Build your project
npx tsc

# Check your types
npx @arethetypeswrong/cli --pack .

# Convert to ESM
npx ts2esm tsconfig.json

# Rebuild your project
npx tsc

# Check your types again
npx @arethetypeswrong/cli --pack . --ignore-rules cjs-resolves-to-esm
```

## Video Tutorial

Watch this 5-minute video and learn how to migrate from CommonJS to ESM:

[<img src="https://i.ytimg.com/vi_webp/bgGQgSQSpI8/mqdefault.webp">](https://youtu.be/bgGQgSQSpI8)

## Examples

Here you can see the transformations that `ts2esm` applies.

### Require Statements

```ts
const fs = require('node:fs');
const path = require('path');
```

After:

```ts
import fs from 'node:fs';
import path from 'path';
```

### Import Declarations

Before:

```ts
import {AccountAPI} from '../account';
import {RESTClient} from './client/RESTClient';
import {removeSuffix} from '@helpers/removeSuffix';
```

After:

```ts
import {AccountAPI} from '../account/index.js';
import {RESTClient} from './client/RESTClient.js';
import {removeSuffix} from '@helpers/removeSuffix.js';
```

### Export Declarations

Before:

```ts
export * from './account';
export * from './UserAPI';
```

After:

```ts
export * from './account/index.js';
export * from './UserAPI.js';
```

### JSON Import Attributes

Before:

```ts
import listAccounts from '../test/fixtures/listAccounts.json';
```

After:

```ts
import listAccounts from '../test/fixtures/listAccounts.json' with {type: 'json'};
```

### CSS Import Attributes

Before:

```ts
import styles from './MyComponent.module.css';
```

After:

```ts
import styles from './MyComponent.module.css' with {type: 'css'};
```

## How it works

The `ts2esm` program adjusts your relative imports, adding extensions like `index.js` or `.js` to make them ESM-compatible. Say goodbye to import errors such as **TS2305**, **TS2307**, **TS2834**, and [**TS2835**](https://typescript.tv/errors/#ts2835)!

Errors that get automatically fixed (🛠️):

> TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module needs an import assertion of type "json"

> error TS2834: Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Consider adding an extension to the import path.

> error TS2835: Relative import paths need explicit file extensions in EcmaScript imports when '--moduleResolution' is 'node16' or 'nodenext'.

## Noteworthy

With ESM, you can no longer use Node.js objects like `__filename` or `__dirname`. Here is a simple snippet to replicate their behavior using the [import.meta property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta):

```ts
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

## Credits

This program was born from an [inspiring conversation](https://twitter.com/bennycode/status/1693362836695585084) I had with [Basarat Ali Syed](https://twitter.com/basarat). I recommend checking out [Basarat's coding tutorials](https://www.youtube.com/@basarat). 👍

## Attributions

- ts2esm got highlighted in Deno's article on [How to convert CommonJS to ESM](https://deno.com/blog/convert-cjs-to-esm#tools-for-migrating)
- ts2esm helped migrating [cornerstonejs/cornerstone3D](https://github.com/cornerstonejs/cornerstone3D) from CommonJS to ESM

## Used By

[<img src="https://ohif.org/static/c99ccbad57599dbf9f3490519c9b444f/63739/ohif-logo-dark.png" width="256"/>](https://ohif.org/)

## Vision

Ideally, the extension change would be available as a [codefix in TypeScript](https://github.com/microsoft/TypeScript/tree/v5.3.3/src/services/codefixes) itself. Then all conversions could be applied using [ts-fix](https://github.com/microsoft/ts-fix).

## References

- [TypeScript's Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution-is-host-defined)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/)
- [Are the types wrong?](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
