// Paths come from the root tsconfig.json, which this app's tsconfig.json extends
import {lib} from '@mylib';
import {helper} from '@mylib/utils/helper.js';
// Only the second alias target exists
import {schema} from '@generated/schema.js';

console.log(lib, helper, schema);
