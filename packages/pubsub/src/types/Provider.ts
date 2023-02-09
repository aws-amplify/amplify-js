// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable from 'zen-observable-ts';

export interface PubSubOptions {
	[key: string]: any;
	ssr?: boolean;
	PubSub?: {};
}

export interface ProviderOptions {
	[key: string]: any;
	provider?: string | symbol;
}

export interface PubSubProvider {
	// configure your provider
	configure(config: object): object;

	// return 'Analytics';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;

	publish(
		topics: string[] | string,
		msg: object | string,
		options?: ProviderOptions
	): void;

	subscribe(
		topics: string[] | string,
		options?: ProviderOptions
	): Observable<any>;
}
