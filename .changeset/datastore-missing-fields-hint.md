---
'@aws-amplify/datastore': patch
---

fix(datastore): explain missing selection fields when skipping an incoming subscription

When an external GraphQL mutation does not return all the fields DataStore subscribes to, AppSync reports a null for a non-nullable field and DataStore skips the incoming update. The warning now adds a hint that the mutation's selection set is missing fields, instead of only showing the raw GraphQL message.
