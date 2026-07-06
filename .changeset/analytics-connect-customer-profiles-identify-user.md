---
'@aws-amplify/analytics': minor
'@aws-amplify/core': minor
'aws-amplify': minor
---

feat(analytics): add an Amazon Connect Customer Profiles provider that backs `identifyUser` with a REST endpoint (typically fronted by a Lambda). The provider is exposed via the stable subpath `aws-amplify/analytics/customer-profiles` and configured through the `analytics.amazon_connect_customer_profiles` key in `amplify_outputs` (`Analytics.CustomerProfiles = { endpoint, region }`). Additive and non-breaking — the public `IdentifyUserInput`/`UserProfile` signatures are preserved 1:1 and the existing Pinpoint provider is untouched.
