---
'@aws-amplify/api-graphql': patch
---

fix(api-graphql): close a real-time socket whose connection ack timed out, so its later close does not stop the keep-alive check of the retry socket
