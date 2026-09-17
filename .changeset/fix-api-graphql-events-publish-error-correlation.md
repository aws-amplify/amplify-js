---
'@aws-amplify/api-graphql': patch
---

fix(api-graphql): correlate Events publish errors by operation id

The AppSync Events WebSocket is multiplexed across operations, so a single
socket carries error frames for many channels at once. A publish promise
previously rejected on any incoming error frame that carried `data.errors` —
including `subscribe_error` frames belonging to unrelated operations on other
channels — causing publishes to fail spuriously.

Rejection is now gated on `data.id === subscriptionId`, so a publish only
settles on error frames correlated to its own operation id. Error frames for
unrelated operations are ignored, while matching `publish_error` frames still
reject the publish as before.
