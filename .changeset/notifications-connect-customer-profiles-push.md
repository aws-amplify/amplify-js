---
'@aws-amplify/core': minor
'@aws-amplify/notifications': minor
'aws-amplify': minor
---

feat(notifications): add Amazon Connect Customer Profiles push notifications provider

Push Notifications can now be delivered through Amazon Connect Customer Profiles via the new `aws-amplify/push-notifications/customer-profiles` sub-path export. The provider ships `identifyUser`, `initializePushNotifications`, `registerDevice`, and `removeDevice` alongside the transport-agnostic badge, permission, launch-notification, and notification/token listener APIs, with SigV4-signed device registration and client-side user-profile validation. `Amplify.configure` accepts the corresponding `amazon_connect` notifications configuration from `amplify_outputs.json`.

The default `aws-amplify/push-notifications` entry point emits a one-time `ConsoleLogger` notice at runtime directing customers to the Customer Profiles sub-path, since that entry point is backed by Amazon Pinpoint and AWS ends support for Amazon Pinpoint on October 30, 2026. Both changes are backwards compatible: existing exports keep their names, types, and signatures.
