---
'@aws-amplify/api-graphql': patch
'@aws-amplify/interactions': patch
'@aws-amplify/predictions': patch
---

Remove unused uuid dependency from @aws-amplify/api-graphql, @aws-amplify/interactions, and @aws-amplify/predictions packages. All UUID generation is now consolidated through @aws-amplify/core's amplifyUuid wrapper, addressing security advisory GHSA-w5hq-g745-h8pq.
