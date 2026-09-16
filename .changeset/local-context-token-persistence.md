---
"@aws-amplify/auth": patch
"aws-amplify": patch
---

fix(auth): persist sign-in tokens to the per-context orchestrator for a local `AmplifyContext`

User-pool sign-in through a locally created `createAmplifyContext` now persists tokens to that context's own token orchestrator instead of the global singleton (which is only initialized by `Amplify.configure()`), so `fetchAuthSession(ctx)` sees the session. The global `Amplify.configure()` path is unchanged.
