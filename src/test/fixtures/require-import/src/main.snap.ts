import fs from "node:fs";
import path from "path";
fs.access('.', () => {});
console.log(path.basename);
