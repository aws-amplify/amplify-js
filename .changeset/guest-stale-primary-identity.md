---
'@aws-amplify/auth': patch
---

fix(auth): get a guest identityId instead of reusing the signed-in user's identityId when tokens were cleared without signing out
