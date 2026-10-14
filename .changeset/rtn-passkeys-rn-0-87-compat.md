---
'@aws-amplify/rtn-passkeys': minor
---

fix(rtn-passkeys): support React Native 0.81 through 0.87

- Fix the Android build on React Native 0.82+ (the removed `JSONArguments` API is replaced with an internal converter, and `currentActivity` is read from the React context).
- Stop shipping pre-generated codegen output. Apps now generate the native spec with their own React Native version, which avoids mismatches between the bundled code and newer React Native releases.
