---
'@aws-amplify/auth': minor
---

feat(auth): send Cognito threat protection user context data from React Native. Sign-in, sign-up, and password reset flows on iOS and Android now include `UserContextData`, built in JavaScript in the same format as Amplify Swift and Amplify Android, so Cognito can assess device risk for React Native users without an extra native package.
