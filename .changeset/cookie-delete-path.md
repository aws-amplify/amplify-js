---
'@aws-amplify/core': patch
'aws-amplify': patch
'@aws-amplify/adapter-nextjs': patch
---

fix(adapter-nextjs): delete server-side auth cookies with the same Path and Domain they were set with
