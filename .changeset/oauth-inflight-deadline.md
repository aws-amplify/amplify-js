---
'@aws-amplify/auth': patch
---

fix(auth): bound waiting on an inflight OAuth flow with a read-time deadline

`fetchAuthSession` / `getCurrentUser` could previously hang forever when another
tab started `signInWithRedirect` and abandoned the Hosted UI page: the shared
`inflightOAuth` flag has no expiry and the parked promise was only released by
the tab completing the flow.

The flow now records a blocking deadline next to the flag (`inflightOAuthDeadline`,
5 minutes). Token consumers evaluate it at read time and park with a backstop
timer, and a cross-tab storage listener releases waiters as soon as the owning
tab settles the flow. The deadline bounds only how long other work may block —
the completion path deliberately ignores it, and no tab ever mutates another
tab's flow state, so a slow-but-successful login still completes. Flags written
by older library versions are handled by persisting a default deadline on first
observation.
