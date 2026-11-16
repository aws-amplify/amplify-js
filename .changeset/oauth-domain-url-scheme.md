---
'@aws-amplify/auth': minor
'@aws-amplify/adapter-nextjs': minor
---

feat(auth): support full URL and http scheme in OAuth domain for local Cognito emulators

Allow specifying a custom protocol scheme (such as `http://localhost:4566`) in `loginWith.oauth.domain` without enforcing `https://`, enabling testing with local Cognito emulators without requiring a reverse TLS proxy.
