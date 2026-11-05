---
'@aws-amplify/core': minor
---

feat(core): support partitioned attribute in CookieStorage

Allow passing `partitioned?: boolean` in `CookieStorageData` to enable partitioned cookies (CHIPS) when storing cookies in client environments.
