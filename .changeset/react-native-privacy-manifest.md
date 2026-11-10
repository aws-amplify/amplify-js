---
'@aws-amplify/react-native': patch
---

feat(react-native): ship an iOS privacy manifest (`PrivacyInfo.xcprivacy`) with the `AmplifyRTNCore` pod, declaring the device data that Auth sends to Cognito as user context data. This matches the manifest bundled with Amplify Swift's Auth plugin.
