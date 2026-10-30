---
'@aws-amplify/auth': patch
---

fix(auth): get a new guest identityId when the stored one can't be used for guest access (deleted, linked to a login, or malformed), instead of failing on every `fetchAuthSession()` call
