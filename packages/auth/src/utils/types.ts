// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type OpenAuthSession = (
	url: string,
	redirectUrls: string[],
	preferPrivateSession?: boolean
) => Promise<OpenAuthSessionResult | void>;

type OpenAuthSessionResultType = 'canceled' | 'success' | 'error';

export type OpenAuthSessionResult = {
	type: OpenAuthSessionResultType;
	error?: unknown;
	url?: string;
};

export type AmplifyWebBrowser = {
	openAuthSessionAsync: (
		url: string,
		redirectUrls: string[],
		prefersEphemeralSession?: boolean
	) => Promise<string | null>;
};
