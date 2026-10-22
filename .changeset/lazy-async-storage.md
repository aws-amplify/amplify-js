---
'@aws-amplify/core': patch
---

fix(core): load AsyncStorage on first use instead of on import in React Native

The default key-value storage and `Cache` no longer load `@react-native-async-storage/async-storage` when `@aws-amplify/core` is imported. Apps that bring their own storage (for example a custom `credentialsProvider` and `tokenProvider`) can run without AsyncStorage linked. Code that does use the default storage or `Cache` still loads it, and gets the same "Ensure `@react-native-async-storage/async-storage` is installed and linked" error on the first call if it is missing.
