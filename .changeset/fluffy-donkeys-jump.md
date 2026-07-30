---
'@aws-amplify/auth': patch
---

fix(auth): allow prompt=none silent SSO to resume federated sessions

`signInWithRedirect` always appended `identity_provider=COGNITO` to the `/oauth2/authorize` request when no `provider` or `idpIdentifier` was supplied. Cognito treats `identity_provider` as a provider selector, so pinning it to `COGNITO` while requesting a silent sign in with `options.prompt: 'NONE'` restricted the attempt to native Cognito sessions. Users whose live hosted UI session originated from a federated IdP (for example Google or a SAML provider) were rejected with `error=login_required` instead of having their session resumed.

`identity_provider` is now omitted only when `prompt` is `'NONE'` and neither `provider` nor `idpIdentifier` is specified, which lets Cognito resume whichever session is already active. All other behavior is unchanged: an explicit `provider` still sends `identity_provider`, an `idpIdentifier` still sends `idp_identifier`, and the interactive no-argument call still defaults to `identity_provider=COGNITO`.

Fixes https://github.com/aws-amplify/amplify-js/issues/14897
