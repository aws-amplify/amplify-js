// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface AWSLexV2ProviderOption {
	name: string;
	botId: string;
	aliasId: string;
	localeId: string;
	region: string;
	providerName: string;
	onComplete?(botname: string, callback: (err, confirmation) => void): void;
}

export interface AWSLexV2ProviderOptions {
	[key: string]: AWSLexV2ProviderOption;
}
