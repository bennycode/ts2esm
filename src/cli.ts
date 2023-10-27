#!/usr/bin/env node

import {convert} from './convert.js';
import {input} from '@inquirer/prompts';

const args = process.argv.slice(2);
const enableDebug = args.includes('--debug');

let tsConfigFilePath = '';

try {
  tsConfigFilePath = await input({default: 'tsconfig.json', message: 'Enter the file path to your TS config'});
} catch {
  // Capturing "Ctrl + C" in "Inquirer" prompts
  console.log('Goodbye!');
}

if (tsConfigFilePath) {
  convert(
    {
      tsConfigFilePath,
    },
    enableDebug
  );
}
