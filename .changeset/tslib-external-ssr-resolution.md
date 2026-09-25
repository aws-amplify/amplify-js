---
'@aws-amplify/core': patch
---

fix(core): mark tslib as external in the rollup build so ESM/CJS output imports the bare `tslib` specifier instead of a vendored nested copy, fixing SSR module resolution (ERR_MODULE_NOT_FOUND) under bundlers like Nitro/Nuxt
