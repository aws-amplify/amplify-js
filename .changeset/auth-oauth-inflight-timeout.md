---
'@aws-amplify/auth': patch
---

fix(auth): prevent signInWithRedirect hang after native sign-in sheet cancel

Cancelling a native sign-in sheet (for example "Sign in with Apple" on iOS Safari) left the persisted `inflightOAuth` flag set, because dismissing the sheet is neither a navigation nor a bfcache restore and therefore did not trigger the existing cancellation listener. Every subsequent `signIn`, `getCurrentUser`, or `fetchAuthSession` then awaited an inflight promise that had no timeout and no rejection path, so those calls hung permanently until the user cleared site storage.

The inflight OAuth wait is now bounded by an internal timeout. When it elapses, the persisted inflight flag is cleared and all waiters are settled, so token fetching resumes and reports no session in progress instead of hanging. A generation guard ensures an expired timer can never clear the state of an OAuth flow that started after it.

Web cancellation detection now also covers `visibilitychange` and window `focus` while a flow is inflight, guarded against OAuth response parameters in the URL and against a short grace period so a legitimate redirect round-trip is never interrupted. Successful flows, the react-native cancellation path, and existing public APIs are unchanged.

Fixes [#14900](https://github.com/aws-amplify/amplify-js/issues/14900).
