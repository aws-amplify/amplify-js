---
'@aws-amplify/storage': patch
---

fix(storage): merge authenticated and group permissions in `resolveLocationsForCurrentSession` so `allow.authenticated` and `allow.groups(...)` access rules are additive for users in a Cognito group, matching IAM. Fixes StorageBrowser hiding folders and under-reporting permissions when both rule types apply (aws-amplify/amplify-ui#6930).
