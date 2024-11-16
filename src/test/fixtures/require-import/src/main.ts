const fs = require('node:fs');
const path = require('path');

fs.access('.', () => {});
console.log(path.basename);
