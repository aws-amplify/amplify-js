---
'@aws-amplify/core': patch
'aws-amplify': patch
'@aws-amplify/adapter-nextjs': patch
---

Delete server-side auth cookies with the same Path and Domain they were set with

- `@aws-amplify/core`: `CookieStorage.Adapter.delete()` accepts optional `DeleteCookieOptions` (`path`, `domain`).
- `aws-amplify`: the cookie-backed key-value storage passes the `path` and `domain` used by `setItem` when it removes an item.
- `@aws-amplify/adapter-nextjs`: the server cookie adapters include `Path` and `Domain` in the cookie deletion, so auth cookies are removed on `/_next/data`, nested-route and API-route requests.
