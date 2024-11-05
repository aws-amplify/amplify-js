// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type OpenAuthSession = (
	url: string,
	redirectUrls: string[],
	preferPrivateSession?: boolean,
) => Promise<OpenAuthSessionResult | void>;

type OpenAuthSessionResultType = 'canceled' | 'success' | 'error';

export interface OpenAuthSessionResult {
	type: OpenAuthSessionResultType;
	error?: unknown;
	url?: string;
}

export interface AmplifyWebBrowser {
	openAuthSessionAsync(
		url: string,
		redirectUrls: string[],
		prefersEphemeralSession?: boolean,
	): Promise<string | null>;
}
