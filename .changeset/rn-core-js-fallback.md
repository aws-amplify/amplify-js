---
'@aws-amplify/react-native': minor
---

feat: compute SRP values and the device name in JavaScript when the `AmplifyRTNCore` native module isn't linked

`computeModPow`, `computeS` and `getDeviceName` keep using the native module when it's available. When it isn't, they now fall back to JavaScript implementations (built-in `BigInt` with Barrett reduction) instead of throwing a linking error, so Cognito SRP sign-in and device tracking keep working.
