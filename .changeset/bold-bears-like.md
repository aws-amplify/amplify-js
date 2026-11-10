---
'@aws-amplify/datastore': minor
---

Add per-model `syncPageSize` and `maxRecordsToSync` configuration via optional third parameter to `syncExpression()`. This allows configuring sync page size on a per-model basis instead of only globally, so models with large records can use a smaller page size without penalizing sync performance for all other models.
