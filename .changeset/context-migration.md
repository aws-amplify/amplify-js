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
'@aws-amplify/datastore-storage-adapter': patch
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

Compatibility surface and version guidance:

- Deprecated `AmplifyServer` type aliases (`Context`, `ContextSpec`, `ContextToken`,
  `RunOperationWithContext`) and functional `createAmplifyServerContext` /
  `getAmplifyServerContext` / `destroyAmplifyServerContext` shims are restored on the
  internals/adapter-core entries so previously published `@aws-amplify/adapter-nextjs`
  versions keep working. They will be removed in the next major.
- Peer minimums are raised (`@aws-amplify/core` to `^6.19.0` across category packages;
  `aws-amplify` to `^6.21.0` for `@aws-amplify/adapter-nextjs`) to guard against
  version-skewed installs going forward. Note this guard only applies when the
  dependency tree is re-resolved: existing lockfiles, `npm ci`, and installs with
  `--legacy-peer-deps` (or yarn classic's warn-only peers) are not re-checked, and
  already-published category versions still declare the older range. Mixing an older
  scoped category package (e.g. `@aws-amplify/auth` ≤ 6.x pinned to `core ^6.16.2`)
  with a newer core is unsupported — keep directly installed `@aws-amplify/*` category
  packages on the same release line as `aws-amplify`.
