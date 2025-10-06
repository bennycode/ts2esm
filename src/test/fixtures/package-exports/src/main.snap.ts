import omit from 'lodash/omit.js';
import {HttpsError} from 'firebase-functions/v1/https';

const object = {a: 1, b: '2', c: 3};
omit(object, ['a', 'c']);

export function logError() {
  console.log(HttpsError);
}