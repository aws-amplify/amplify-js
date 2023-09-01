// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// import '../Common/Polyfills';
import Observable from 'zen-observable-ts';

import {
	Amplify,
	browserOrNode,
	ConsoleLogger as Logger,
} from '@aws-amplify/core';
import { PubSubProvider, ProviderOptions } from './types';
import { InternalPubSubClass } from './internals';

type PubSubObservable = {
	provider: PubSubProvider;
	value: string | Record<string, unknown>;
};

export class PubSubClass extends InternalPubSubClass {
	public getModuleName() {
		return 'PubSub';
	}

	subscribe(
		topics: string[] | string,
		options?: ProviderOptions
	): Observable<PubSubObservable> {
		return super.subscribe(topics, options);
	}
}

export const PubSub = new PubSubClass();
Amplify.register(PubSub);
