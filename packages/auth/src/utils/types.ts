// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type OpenAuthSession = (
	url: string,
	redirectSchemes: string[]
) => Promise<OpenAuthSessionResult> | void;

type OpenAuthSessionResultType = 'canceled' | 'success' | 'unknown';

export type OpenAuthSessionResult = {
	type: OpenAuthSessionResultType;
	url?: string;
};

export type AmplifyWebBrowser = {
	openAuthSessionAsync: (
		url: string,
		redirectSchemes: string[]
	) => Promise<string | null>;
};
