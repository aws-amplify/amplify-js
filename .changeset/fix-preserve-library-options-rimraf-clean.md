---
'aws-amplify': patch
'@aws-amplify/adapter-nextjs': patch
'@aws-amplify/analytics': patch
'@aws-amplify/api': patch
'@aws-amplify/api-graphql': patch
'@aws-amplify/api-rest': patch
'@aws-amplify/auth': patch
'@aws-amplify/core': patch
'@aws-amplify/datastore': patch
'@aws-amplify/geo': patch
'@aws-amplify/interactions': patch
'@aws-amplify/notifications': patch
'@aws-amplify/predictions': patch
'@aws-amplify/pubsub': patch
'@aws-amplify/storage': patch
---

fix(aws-amplify): preserve library options on partial configure after Auth is set up.

Also fix Windows `clean:size` scripts to use `rimraf --glob` for `tmp*` with rimraf v6.
