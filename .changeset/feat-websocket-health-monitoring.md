---
'@aws-amplify/api-graphql': minor
---

feat(api-graphql): add WebSocket connection health monitoring

Add `getConnectionHealth()` and `isConnected()` methods to the WebSocket provider,
enabling consumers to check real-time connection health status and keep-alive staleness.
