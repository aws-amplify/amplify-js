---
'@aws-amplify/notifications': minor
'aws-amplify': minor
'@aws-amplify/core': minor
---

feat(notifications): add an Amazon Connect Customer Profiles provider for Push Notifications device registration.

This adds a new, opt-in Push Notifications provider backed by Amazon Connect Customer Profiles, exposed as a new subpath export alongside the existing Pinpoint provider (mirroring how the Analytics Customer Profiles provider is exposed):

- `aws-amplify/push-notifications/customer-profiles`
- `@aws-amplify/notifications/push-notifications/customer-profiles`

With this provider, `initializePushNotifications` (device-token registration) and `identifyUser` register the device with Amazon Connect Customer Profiles instead of calling the Pinpoint `UpdateEndpoint` API. Two authorization modes are selected automatically from the resolved auth session:

- Authenticated (Cognito user-pool): `POST {endpoint}/identify-user` with an `Authorization: Bearer <accessToken>` header; the backend keys the profile on the verified `sub`.
- Guest (Identity Pool unauthenticated): `POST {endpoint}/identify-user-guest`, SigV4-signed (`execute-api`) with the guest credentials; the backend keys the profile on the caller's `identityId`. This lets an app register a device token and receive push before sign-in. On a later authenticated call, pass the prior guest `identityId` via `options.previousGuestIdentityId` to fold the guest profile (and its devices) into the authenticated profile.

It is configured through the new `notifications.amazon_connect_customer_profiles` key in `amplify_outputs` (`Notifications.PushNotification.CustomerProfiles = { endpoint, region }`). All public method signatures (`identifyUser`, `IdentifyUserInput`, and every `on*`/`get*`/`request*`/`setBadgeCount` API) plus the native event bus and token lifecycle match the Pinpoint provider 1:1; `IdentifyUserInput`'s options additionally accept optional `deviceId`/`platform`/`appVersion`/`previousGuestIdentityId` device-registration fields. The Customer Profiles provider does not emit Pinpoint engagement telemetry (`_campaign.*`/`_journey.*`), as Amazon Connect Customer Profiles has no client-side event API.

This is additive and non-breaking:
- The default `aws-amplify/push-notifications` (and `@aws-amplify/notifications/push-notifications`) export is unchanged and still resolves to the Amazon Pinpoint provider, including its engagement telemetry. The existing `aws-amplify/push-notifications/pinpoint` subpath is likewise unchanged.
- `@aws-amplify/core` gains an optional `Notifications.PushNotification.CustomerProfiles` config type (Pinpoint config remains supported side-by-side) and parses the new `notifications.amazon_connect_customer_profiles` `amplify_outputs` key in addition to the existing Pinpoint notifications config.
