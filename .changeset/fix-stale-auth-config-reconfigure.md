---
'aws-amplify': patch
---

fix(auth): update token provider auth config on reconfigure

When `Amplify.configure()` is called multiple times to switch `userPoolClientId`,
the token provider now receives the updated auth config, ensuring token refresh
uses the correct client ID.
