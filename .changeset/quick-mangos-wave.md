---
'@aws-amplify/api-graphql': patch
---

fix(api-graphql): keep Events subscribe authorization errors scoped to a single subscription

An authorization error on an Events subscribe (for example a per-subscription `util.unauthorized()` deny, surfaced as errorType `Unauthorized`) is no longer treated as a connection-level auth failure. Previously it closed the shared WebSocket, which tore down sibling subscriptions and, for a permanently denied channel, produced an unbounded deny/reconnect loop. The error is now delivered only to the affected subscription; other active subscriptions and the shared socket stay connected. Connection-level `GQL_ERROR` auth failures still trigger a reconnect as before.

Fixes https://github.com/aws-amplify/amplify-js/issues/14947
