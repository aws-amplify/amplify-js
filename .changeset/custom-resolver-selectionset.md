---
'@aws-amplify/api-graphql': minor
---

feat(api-graphql): support selectionSet in custom queries, mutations, and subscriptions

Adds support for custom `selectionSet` in custom operations generated from client schema definitions, enabling fine-grained field selection on custom resolvers returning models or non-model types.
