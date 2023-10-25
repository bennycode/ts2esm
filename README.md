# ts2em

Automatically fixes your relative TypeScript imports into ESM-compatible imports.

---

Bugs that can get automatically fixed by using `ts2esm`:

> **error TS2835:** Relative import paths need explicit file extensions in EcmaScript imports when '`--moduleResolution`' is '`node16`' or '`nodenext`'. Did you mean '`./RESTClient.js`'?

---

Turns:

```ts
import {RESTClient} from './client/RESTClient';
```

Into:

```ts
import {RESTClient} from './client/RESTClient.js';
```
