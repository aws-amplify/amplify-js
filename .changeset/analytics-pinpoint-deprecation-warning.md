---
'@aws-amplify/analytics': patch
'aws-amplify': patch
---

feat(analytics): warn on deprecated default (Pinpoint) exports

The default (Amazon Pinpoint) Analytics APIs (`record`, `identifyUser`, `configureAutoTrack`, `flushEvents`) now emit a one-time `ConsoleLogger` deprecation warning at runtime, pointing customers to the supported sub-path exports (`aws-amplify/analytics/kinesis`, `aws-amplify/analytics/kinesis-firehose`, `aws-amplify/analytics/personalize`). AWS ends support for Amazon Pinpoint on October 30, 2026. This is non-breaking: types and signatures are preserved.
