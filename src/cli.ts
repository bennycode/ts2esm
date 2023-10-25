#!/usr/bin/env node

import {convert} from './convert.js';

convert({
  tsConfigFilePath: 'tsconfig.json',
});
