// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type OpenAuthSession = (
	url: string,
	redirectSchemes: string[]
) => Promise<OpenAuthSessionResult> | void;

type OpenAuthSessionResultType = 'canceled' | 'success' | 'error';

export type OpenAuthSessionResult = {
	type: OpenAuthSessionResultType;
	error?: unknown;
	url?: string;
};

export type AmplifyWebBrowser = {
	openAuthSessionAsync: (
		url: string,
		redirectSchemes: string[]
	) => Promise<string | null>;
};
