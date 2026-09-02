---
'@aws-amplify/core': minor
'@aws-amplify/auth': minor
'@aws-amplify/storage': minor
'@aws-amplify/analytics': minor
'@aws-amplify/api': minor
'@aws-amplify/api-rest': minor
'@aws-amplify/api-graphql': minor
'@aws-amplify/geo': minor
'@aws-amplify/interactions': minor
'@aws-amplify/notifications': minor
'@aws-amplify/predictions': minor
'@aws-amplify/pubsub': minor
'@aws-amplify/adapter-nextjs': minor
'aws-amplify': minor
'@aws-amplify/datastore': patch
---

feat: explicit AmplifyContext support across all categories.

Adds context-first overloads (`fn(ctx, input)`) to category APIs alongside the existing
singleton-based forms, a public `createAmplifyContext(resourcesConfig, libraryOptions?)`
factory for isolated per-request/per-tenant contexts, per-request context isolation in
`@aws-amplify/adapter-nextjs` SSR, typed misuse errors (`InvalidAmplifyContextError`,
`NoAmplifyContextError`), and a shared testing entry (`@aws-amplify/core/internals/testing`).

Backward compatible: existing application code — including pre-context SSR
`operation: (contextSpec) => fetchAuthSession(contextSpec)` — compiles and behaves
unchanged via deprecated type aliases. Includes two api-graphql bug fixes: SSR request
clients now honor client-level options (previously silently dropped), and events error
messages accurately describe failures.
