---
'@aws-amplify/api-graphql': patch
---

fix(api-graphql): send the explicit `authToken` (or `Authorization` header) in the real-time connection handshake for `oidc` and `userPool` auth modes, instead of always sending the session access token
