---
'@aws-amplify/auth': minor
'aws-amplify': minor
---

feat(auth): send Cognito threat protection user context data from React Native. On iOS and Android, sign-in, sign-up, and password reset requests now include `UserContextData`, built in the same format as Amplify Swift and Amplify Android. This sends device data to Cognito on those requests: a persistent random device ID (stored in `defaultStorage` under `amplify-cognito-asf-device-id`), the device name, OS version, screen size, locale, and timezone, plus brand, manufacturer, model, and build fingerprint on Android. Account for this in your App Store privacy label and Google Play Data safety form.
