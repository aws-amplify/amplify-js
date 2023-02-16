// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InteractionsOptions } from './Interactions';
import { InteractionsResponse } from './Response';

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

export interface InteractionsProviders {
	[key: string]: InteractionsProvider;
}
