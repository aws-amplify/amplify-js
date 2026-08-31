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

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export const PubSub = new PubSubClass();
Amplify.register(PubSub);
