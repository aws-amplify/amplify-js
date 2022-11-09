// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PromiseHandlers {
	resolve: Function;
	reject: Function;
}

export interface AnalyticsProvider {
	// you need to implement those methods

	// configure your provider
	configure(config: object): object;

	// record events and returns true if succeeds
	record(params: object, handlers?: PromiseHandlers): Promise<boolean>;

	// return 'Analytics';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;
}
