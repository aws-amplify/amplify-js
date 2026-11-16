// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const getOAuthBaseUrl = (domain: string): string =>
	/^https?:\/\//.test(domain) ? domain : `https://${domain}`;

export const createAuthorizeEndpoint = (
	domain: string,
	urlSearchParams: URLSearchParams,
): string =>
	new URL(
		`${getOAuthBaseUrl(domain)}/oauth2/authorize?${urlSearchParams.toString()}`,
	).toString();

export const createTokenEndpoint = (domain: string): string =>
	new URL(`${getOAuthBaseUrl(domain)}/oauth2/token`).toString();

export const createRevokeEndpoint = (domain: string) =>
	new URL(`${getOAuthBaseUrl(domain)}/oauth2/revoke`).toString();

export const createSignUpEndpoint = (
	domain: string,
	urlSearchParams: URLSearchParams,
): string =>
	new URL(
		`${getOAuthBaseUrl(domain)}/signup?${urlSearchParams.toString()}`,
	).toString();

export const createLogoutEndpoint = (
	domain: string,
	urlSearchParams: URLSearchParams,
): string =>
	new URL(
		`${getOAuthBaseUrl(domain)}/logout?${urlSearchParams.toString()}`,
	).toString();
