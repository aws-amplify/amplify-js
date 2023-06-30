// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PromiseHandlers {
	resolve: Function;
	reject: Function;
}

// CAUTION: The AnalyticsProvider interface is publicly available and allows customers to implement their own custom
// analytics providers. Exercise caution when modifying this class as additive changes to this interface can break
// customers when not marked as optional.
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
