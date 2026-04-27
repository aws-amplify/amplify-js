---
'@aws-amplify/adapter-nextjs': patch
---

fix(adapter-nextjs): match percent-encoded cookie names on read so sign-out clears Cognito session cookies for usernames containing URL-unsafe characters (e.g. `@`)
