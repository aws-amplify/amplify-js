// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CookieStorage } from 'aws-amplify/adapter-core';

import {
	AUTH_FLOW_PROOF_COOKIE_EXPIRY,
	IS_SIGNING_OUT_COOKIE_NAME,
	PKCE_COOKIE_NAME,
	STATE_COOKIE_NAME,
} from '../constant';

export const createSignInFlowProofCookies = ({
	state,
	pkce,
}: {
	state: string;
	pkce: string;
}) => [
	{
		name: PKCE_COOKIE_NAME,
		value: pkce,
	},
	{
		name: STATE_COOKIE_NAME,
		value: state,
	},
];

export const createSignOutFlowProofCookies = () => [
	{
		name: IS_SIGNING_OUT_COOKIE_NAME,
		value: 'true',
	},
];

export const createAuthFlowProofCookiesSetOptions = (
	setCookieOptions: CookieStorage.SetCookieOptions,
	overrides?: Pick<CookieStorage.SetCookieOptions, 'secure'>,
) => ({
	domain: setCookieOptions?.domain,
	path: '/',
	httpOnly: true,
	secure: overrides?.secure ?? true,
	sameSite: 'lax' as const,
	expires: new Date(Date.now() + AUTH_FLOW_PROOF_COOKIE_EXPIRY),
});

export const createAuthFlowProofCookiesRemoveOptions = (
	setCookieOptions: CookieStorage.SetCookieOptions,
) => ({
	domain: setCookieOptions?.domain,
	path: '/',
	expires: new Date('1970-01-01'),
});
