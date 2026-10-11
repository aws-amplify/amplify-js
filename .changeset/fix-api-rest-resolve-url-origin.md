---
'@aws-amplify/api-rest': patch
---

fix(api-rest): require REST request URLs to resolve to the configured endpoint origin

REST API calls whose `path` would change the configured endpoint's host, port, or protocol (for example, a path without a leading `/` on an endpoint that has no trailing path) now reject with an `InvalidPath` validation error instead of sending the request to the resulting URL.
