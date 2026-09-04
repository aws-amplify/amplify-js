---
'@aws-amplify/auth': minor
'@aws-amplify/core': minor
'aws-amplify': minor
---

feat(auth): add multi-session multi-profile support. Introduces `setCurrentUser` and `listCurrentUsers` (client and server-side), an `AuthUserList` session roster alongside `LastAuthUser`, and boundary Hub events (`userSignedIn`, `switchActiveUser`, `userSignedOut`). Multiple Cognito users can be signed in simultaneously with one active session at a time.
