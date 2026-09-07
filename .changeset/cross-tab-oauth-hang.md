---
'@aws-amplify/auth': patch
---

fix(auth): prevent `fetchAuthSession`/`getCurrentUser` from hanging after a cross-tab or abandoned `signInWithRedirect` OAuth flow. A tab that did not itself process the OAuth redirect response no longer blocks indefinitely on the shared `inflightOAuth` flag; it releases when another tab clears the flag or, for an abandoned flow, after a bounded timeout, while a tab actively completing its own redirect keeps waiting.
