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
export { createOnSignInCompletedRedirectIntermediate } from './createOnSignInCompletedRedirectIntermediate';
export { createUrlSearchParamsForSignInSignUp } from './createUrlSearchParams';
export {
	createAuthorizeEndpoint,
	createSignUpEndpoint,
	createLogoutEndpoint,
	createTokenEndpoint,
	createRevokeEndpoint,
} from './cognitoHostedUIEndpoints';
export { getAccessTokenUsernameAndClockDrift } from './getAccessTokenUsernameAndClockDrift';
export { getCookieValuesFromNextApiRequest } from './getCookieValuesFromNextApiRequest';
export { getCookieValuesFromRequest } from './getCookieValuesFromRequest';
export {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
} from './handlerParametersTypeAssertions';
export {
	hasUserSignedInWithAppRouter,
	hasUserSignedInWithPagesRouter,
} from './hasUserSignedIn';
export { isSupportedAuthApiRoutePath } from './isSupportedAuthApiRoutePath';
export { isValidOrigin, isNonSSLOrigin } from './isValidOrigin';
export { resolveCodeAndStateFromUrl } from './resolveCodeAndStateFromUrl';
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
} from './tokenCookies';
