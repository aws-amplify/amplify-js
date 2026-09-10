// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InteractionsOptions } from './Interactions';
import { InteractionsResponse } from './Response';

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InteractionsProvider {
	// configure your provider
	configure(config: InteractionsOptions): InteractionsOptions;

	// return 'Interactions'
	getCategory(): string;

	// return the name of your provider
	getProviderName(): string;

	sendMessage(botname: string, message: string | Object): Promise<object>;

	onComplete(
		botname: string,
		callback: (err: any, confirmation: InteractionsResponse) => void
	);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InteractionsProviders {
	[key: string]: InteractionsProvider;
}
