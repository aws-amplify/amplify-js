// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type WebBrowserNativeModule = {
	openAuthSessionAsync: (
		url: string,
		redirectUrl?: string,
		prefersEphemeralSession?: boolean
	) => Promise<string | null>;
};
