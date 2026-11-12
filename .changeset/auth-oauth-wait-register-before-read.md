---
'@aws-amplify/auth': patch
---

fix(auth): release token consumers when a redirect sign-in fails during their inflight OAuth deadline read, and stop a stale deadline re-check from releasing waiters of a newer flow
