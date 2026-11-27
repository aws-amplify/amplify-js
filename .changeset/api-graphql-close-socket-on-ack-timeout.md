---
'@aws-amplify/api-graphql': patch
---

fix(api-graphql): when a real-time handshake fails (an ack timeout or a connection_error), clear its ack timer and detach and close its socket, so a late event of that socket does not stop the keep-alive check of the retry socket
