---
'@aws-amplify/api-graphql': patch
---

fix(api-graphql): report `Connected` instead of `ConnectedPendingDisconnect` when a real-time connection succeeds on a retry after a connection ack timeout, so a later disconnect triggers an automatic reconnect
