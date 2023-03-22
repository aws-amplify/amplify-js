// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable from 'zen-observable-ts';
import { PubSubContent } from './PubSub';

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
	configure(config: Record<string, unknown>): Record<string, unknown>;

	// return 'Analytics';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;

	publish(
		topics: string[] | string,
		msg: PubSubContent,
		options?: ProviderOptions
	): void;

	subscribe(
		topics: string[] | string,
		options?: ProviderOptions
	): Observable<PubSubContent>;
}
