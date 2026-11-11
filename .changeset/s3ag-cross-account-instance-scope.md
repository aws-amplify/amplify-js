---
'@aws-amplify/storage': minor
---

feat(storage): add `instanceScope` option for S3 Access Grants cross-account sharing

Adds an optional `instanceScope` (`SELF` | `ALL`) to the internal
`listCallerAccessGrants` and `getDataAccess` APIs, threaded into the s3control
request builders as the `instanceScope` query param. Also surfaces each grant's
owning instance account id (parsed from `AccessGrantsInstanceArn`) on
`LocationAccess` as `ownerAccountId`, so cross-account locations can set a
per-location `expectedBucketOwner`. Default behavior is unchanged: when
`instanceScope` is unset no query param is sent, preserving the `SELF`-only
behavior.
