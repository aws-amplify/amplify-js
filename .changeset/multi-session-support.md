---
'@aws-amplify/auth': minor
'@aws-amplify/core': minor
'aws-amplify': minor
---

feat(auth): add multi-session multi-profile support. Introduces `setCurrentUser` and `listCurrentUsers` (client and server-side), an `AuthUserList` session roster alongside `LastAuthUser`, and boundary Hub events (`userSignedIn`, `switchActiveUser`, `userSignedOut`). Multiple Cognito users can be signed in simultaneously with one active session at a time.

Behavior changes for existing single-session apps:

- `signIn` no longer throws `UserAlreadyAuthenticatedException` when a user is already signed in. It now adds a second session and switches the active user to it. (OAuth `signInWithRedirect` still requires `options.prompt` to add another user — without it the Hosted UI SSO cookie would silently reuse the existing session.)
- The `signedIn` Hub event no longer fires on re-authentication of the already-active user. It fires only on active-pointer none→some transitions (first sign-in or reactivating a parked session).
- OAuth completion now throws instead of persisting the `'username'` sentinel when no username claim can be resolved from the returned tokens.
