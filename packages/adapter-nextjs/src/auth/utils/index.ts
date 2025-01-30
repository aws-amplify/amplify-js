// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { appendSetCookieHeaders } from './appendSetCookieHeaders';
export { exchangeAuthNTokens, revokeAuthNTokens } from './authNTokens';
export { appendSetCookieHeadersToNextApiResponse } from './appendSetCookieHeadersToNextApiResponse';
export {
	createSignInFlowProofCookies,
	createSignOutFlowProofCookies,
	createAuthFlowProofCookiesSetOptions,
	createAuthFlowProofCookiesRemoveOptions,
} from './authFlowProofCookies';
export { createAuthFlowProofs } from './createAuthFlowProofs';
export { createErrorSearchParamsString } from './createErrorSearchParamsString';
export { createOnSignInCompleteRedirectIntermediate } from './createOnSignInCompleteRedirectIntermediate';
export { createUrlSearchParamsForSignInSignUp } from './createUrlSearchParams';
export {
	createAuthorizeEndpoint,
	createSignUpEndpoint,
	createLogoutEndpoint,
	createTokenEndpoint,
	createRevokeEndpoint,
} from './cognitoHostedUIEndpoints';
export { getAccessTokenUsername } from './getAccessTokenUsername';
export { getCookieValuesFromNextApiRequest } from './getCookieValuesFromNextApiRequest';
export { getCookieValuesFromRequest } from './getCookieValuesFromRequest';
export { getRedirectOrDefault } from './getRedirectOrDefault';
export {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
} from './predicates';
export {
	hasActiveUserSessionWithAppRouter,
	hasActiveUserSessionWithPagesRouter,
} from './hasActiveUserSession';
export { isSupportedAuthApiRoutePath } from './isSupportedAuthApiRoutePath';
export { isValidOrigin, isSSLOrigin } from './origin';
export { parseSignInCallbackUrl } from './parseSignInCallbackUrl';
export { resolveIdentityProviderFromUrl } from './resolveIdentityProviderFromUrl';
export {
	resolveRedirectSignInUrl,
	resolveRedirectSignOutUrl,
} from './resolveRedirectUrl';

export {
	createTokenCookies,
	createTokenRemoveCookies,
	createTokenCookiesSetOptions,
	createTokenCookiesRemoveOptions,
	isServerSideAuthAllowedCookie,
} from './tokenCookies';
