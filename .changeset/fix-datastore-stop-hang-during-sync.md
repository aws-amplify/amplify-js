---
'@aws-amplify/datastore': patch
---

fix(datastore): prevent `DataStore.stop()` and `DataStore.clear()` from hanging when called before the initial sync is ready
