---
"@aws-amplify/datastore": patch
---

fix(datastore): bump immer to ^11.1.9 to remediate prototype pollution

`@aws-amplify/datastore` depended on `immer@9.0.6`, which is vulnerable to prototype pollution via `draft.constructor.prototype` (affects immer 4.0.0–11.1.8; bypasses the earlier CVE-2021-23436 remediation). Bump immer to `^11.1.9`, the first fixed release. DataStore uses only stable immer core APIs (`produce`, `Draft`, `immerable`, `setAutoFreeze`, `enablePatches`, `Patch`, `applyPatches`), which are preserved across the 9 → 11 major versions.
