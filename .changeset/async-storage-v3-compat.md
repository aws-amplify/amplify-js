---
'@aws-amplify/react-native': patch
'@aws-amplify/datastore': patch
---

fix(react-native): support `@react-native-async-storage/async-storage` v3, which replaced `multiGet`, `multiSet` and `multiRemove` with `getMany`, `setMany` and `removeMany`, so that `DataStore.start()` no longer fails with `undefined is not a function`
