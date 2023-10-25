# ts-node-starter

The `ts-node-starter` scaffolding project is a [template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) which makes it easy for you to start a new Node.js project with TypeScript.

Using this template, you can build **standalone apps**, **libraries** and/or **CLI tools**. The `ts-node-starter` setup is configurable and comes with a lot of features included.

## Features

1. **Changelog generation** powered by [generate-changelog](https://github.com/lob/generate-changelog)
1. **Automatic code & config formatting** powered by [Lefthook](https://github.com/evilmartians/lefthook)
1. **Automatic dependency updates** powered by [Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
1. **Config formatting** powered by [Prettier](https://prettier.io/)
1. **Code linting** powered by [ESLint](https://eslint.org/)
1. **Continuous integration** powered by [GitHub Actions workflows](https://docs.github.com/en/actions/using-workflows)
1. **Dependency management** powered by [npm](https://www.npmjs.com/)
1. **Unit testing** powered by [Vitest](https://vitest.dev/)
1. **Code coverage** powered by [v8](https://v8.dev/blog/javascript-code-coverage)
1. **Code coverage reports** powered by [Codecov](https://about.codecov.io/)
1. **Type checking** powered by [TypeScript](https://www.typescriptlang.org/)
1. **Streamlined scripts** powered by [Conventional Scripts](https://conventionalscripts.org/)

## Usage

### Make it your own

1. Replace all occurrences of "bennycode" with your own username (or organization name)
2. Replace all occurrences of "ts-node-starter" with your project name (or repository name)
3. Start writing your code in the ["src" directory](./src)
4. Run `npm install` and be happy! 😊

### Build a standalone app

**Source Code**

If you just want to write and run a Node.js app, checkout ["src/start.ts"](./src/start.ts).

**References**

You can start your application by executing `yarn start`. If you want to debug your code, run `yarn debug` ([Debug Instructions](https://dev.to/typescripttv/debug-your-node-js-app-with-chrome-devtools-4c98)).

### Build a Library

**Source Code**

If you want to distribute your code as a Node.js library on [npm](https://www.npmjs.com/), you can have a look at ["src/index.ts"](./src/index.ts). If you build a library, I recommend to always ship an index file from where you export the code of your library for others.

**References**

In the ["package.json" file](./package.json) you will also discover a "main" property which defines the entry point to your library when it gets imported by other developers. The value of the "main" property has to point to the transpiled JavaScript code.

### Build a CLI

**Source Code**

If you want to build a CLI tool for Node.js, you can have a look at ["src/cli.ts"](./src/cli.ts).

**References**

In the ["package.json" file](./package.json) you will also discover a "bin" property which defines the executable name of your tool and the entry point to its transpiled JavaScript code.

If you don't want to publish a CLI, simply remove the "bin" property and the CLI script.

## Conventions

### Test Files

I recommend to colocate your test code with your source code by naming your test files `*.test.ts`.

### Changelog Generation

The automatic changelog generation is based on [Semantic Commit Messages](https://sparkbox.com/foundry/semantic_commit_messages). Simply use the suggested prefixes in your commit messages to make use of it. For example, if you commit a new feature use the "feat" prefix:

**Commit Message**

> feat: My new feature

## Troubleshooting

If you're having trouble with the Git pre-commit hook, then reinstall the hook using the following command:

```bash
npx lefthook install -a
```

Source: [Hooks don't run](https://github.com/evilmartians/lefthook/wiki/Troubleshooting)

## Important Refactorings

1. Replaced [EditorConfig](https://editorconfig.org/) with [Prettier](https://prettier.io/) ([2e24f7b](https://github.com/bennycode/ts-node-starter/commit/2e24f7be5f427c26d6cc8281438a6398a211b75c))
1. Replaced [Jasmine](https://jasmine.github.io/) with [Jest](https://jestjs.io/) ([41e9b42](https://github.com/bennycode/ts-node-starter/commit/41e9b42bb5b7ca364dbbabf1104955090003d1be))
1. Replaced [action-dependabot-auto-merge](https://github.com/ahmadnassri/action-dependabot-auto-merge) with [Dependabot](https://github.com/dependabot) & [GitHub CLI](https://cli.github.com/) ([86d5696](https://github.com/bennycode/ts-node-starter/commit/86d5696113c2fb4907a1666e25d1b72d698b06a5))
1. Replaced [husky](https://github.com/typicode/husky) with [Lefthook](https://github.com/evilmartians/lefthook) ([9c41615](https://github.com/bennycode/ts-node-starter/commit/9c4161509acf49e56042383c9ea340f68f248582))
1. Replaced custom [ESLint](https://eslint.org/) Config with a [Shareable Config](https://eslint.org/docs/latest/developer-guide/shareable-configs) ([eef5927](https://github.com/bennycode/ts-node-starter/commit/eef59275e91f6f484f7a917fdd87b09318ebbad3))
1. Replaced [@types/jest](https://www.npmjs.com/package/@types/jest) with [@jest/globals](https://jestjs.io/docs/getting-started#type-definitions) ([73c5bc2](https://github.com/bennycode/ts-node-starter/commit/73c5bc246de79ca2cc805a8b61e42bec39cb97fd))
1. Replaced [Yarn 1](https://classic.yarnpkg.com/) with [npm](https://www.npmjs.com/) ([153b726](https://github.com/bennycode/ts-node-starter/commit/153b726761db302fa3ba57ed1d71aabae01d8394))
1. Replaced [pretty-quick](https://www.npmjs.com/package/pretty-quick) with [Prettier 3](https://prettier.io/) ([7623ba8](https://github.com/bennycode/ts-node-starter/commit/7623ba894e6767d7da8ce5b8a1e2469639bcb027))
1. Replaced [Jest](https://jestjs.io/) with [Vitest](https://vitest.dev/) ([662dddf](https://github.com/bennycode/ts-node-starter/commit/662dddf92d418d0e1119a04d8f5fe807a7a566f0))
1. Replaced [CommonJS](https://nodejs.org/api/modules.html) with [EcmaScript Modules](https://nodejs.org/api/esm.html) ([0cae631](https://github.com/bennycode/ts-node-starter/commit/0cae631ca6457026919418ddb3a10f7858e9ad55))

## Contributors

[![Benny Neugebauer on Stack Exchange][stack_exchange_bennycode_badge]][stack_exchange_bennycode_url]

[![Panayiotis Lipiridis on Stack Exchange][stack_exchange_lipis_badge]][stack_exchange_lipis_url]

[stack_exchange_bennycode_badge]: https://stackexchange.com/users/flair/203782.png?theme=default
[stack_exchange_bennycode_url]: https://stackexchange.com/users/203782/benny-neugebauer?tab=accounts
[stack_exchange_lipis_badge]: https://stackexchange.com/users/flair/5282.png?theme=default
[stack_exchange_lipis_url]: https://stackexchange.com/users/5282/lipis?tab=accounts
