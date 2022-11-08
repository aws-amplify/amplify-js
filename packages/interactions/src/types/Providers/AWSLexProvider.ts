// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface AWSLexProviderOption {
	name: string;
	alias: string;
	region: string;
	providerName?: string;
	onComplete?(botname: string, callback: (err, confirmation) => void): void;
}

export interface AWSLexProviderOptions {
	[key: string]: AWSLexProviderOption;
}
