---
'@aws-amplify/datastore': patch
---

fix(datastore): match outbox mutations by model as well as id, so models that share a primary key value no longer receive each other's `_version`, merge into each other's pending mutations, or block each other's incoming updates (#13412)
