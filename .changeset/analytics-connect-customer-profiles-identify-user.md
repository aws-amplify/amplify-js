---
'@aws-amplify/analytics': minor
'@aws-amplify/core': minor
'aws-amplify': minor
---

feat(analytics): add an Amazon Connect Customer Profiles provider that backs `identifyUser` with a REST endpoint (typically fronted by a Lambda). The provider is exposed via the stable subpath `aws-amplify/analytics/customer-profiles` and configured through the `analytics.amazon_connect_customer_profiles` key in `amplify_outputs` (`Analytics.CustomerProfiles = { endpoint, region }`).

`identifyUser` supports both authenticated and guest (unauthenticated) callers, selected automatically from the resolved auth session: authenticated (Cognito user pool) calls `POST /identify-user` with an `Authorization: Bearer <token>` header, while guest (Cognito Identity Pool) calls are SigV4-signed for `execute-api` and sent to `POST /identify-user-guest` using the guest credentials — enabling pre-sign-in use cases such as registering a device before login. New optional `options` fields (`deviceId`, `platform`, `appVersion`, and `previousGuestIdentityId`) are supported; passing `previousGuestIdentityId` on an authenticated call folds the prior guest profile (and its devices) into the authenticated profile (merge-on-sign-in).

Additive and non-breaking — the public `IdentifyUserInput`/`UserProfile` signatures are preserved 1:1 and the existing Pinpoint provider is untouched.
