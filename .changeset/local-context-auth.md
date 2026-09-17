---
"aws-amplify": patch
"@aws-amplify/auth": patch
"@aws-amplify/core": patch
---

fix(auth): support user-pool sign-in through a local `createAmplifyContext()` without `Amplify.configure()`

Makes a locally created `AmplifyContext` (`createAmplifyContext()`, without calling `Amplify.configure()`) usable end-to-end for Cognito user-pool auth:

- `Amplify.getConfig()` again returns an empty config (`{}`) with a warning before `configure()` instead of throwing `NoAmplifyContextError`, restoring the released 6.20.0 contract that the explicit-AmplifyContext migration (#14931) unintentionally changed.
- Cognito sign-in, `fetchAuthSession`, and the device APIs now resolve the per-context token orchestrator at the flow entry point (falling back to the global singleton for the `Amplify.configure()` path), so tokens persist to and are read from the same per-context store. The global `Amplify.configure()` path is unchanged.
- Known limitation: OAuth (`signInWithRedirect`) sign-in tokens still cache to the **global** orchestrator, because OAuth completion runs after a full-page redirect via `enableOAuthListener`, at which point no `AmplifyContext` survives — so a local `createAmplifyContext()` that initiates `signInWithRedirect` cannot read its OAuth tokens back per-context. This fix covers user-pool (non-redirect) sign-in.
