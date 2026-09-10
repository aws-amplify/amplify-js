// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface AWSLexV2ProviderOption {
	name: string;
	botId: string;
	aliasId: string;
	localeId: string;
	region: string;
	providerName: string;
	onComplete?(botname: string, callback: (err, confirmation) => void): void;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface AWSLexV2ProviderOptions {
	[key: string]: AWSLexV2ProviderOption;
}
