// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable from 'zen-observable-ts';
import { PubSubProvider, ProviderOptions } from '../types/Provider';
import {
	CustomUserAgentDetails,
	ConsoleLogger as Logger,
} from '@aws-amplify/core';
import { PubSubContent } from '../types/PubSub';

const logger = new Logger('AbstractPubSubProvider');

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export abstract class AbstractPubSubProvider<T extends ProviderOptions>
	implements PubSubProvider
{
	private _config: T;

	constructor(options: T) {
		this._config = options;
	}

	configure(config: T): T {
		this._config = { ...config, ...this._config };

		logger.debug(`configure ${this.getProviderName()}`, this._config);

		return this.options;
	}

	getCategory() {
		return 'PubSub';
	}

	abstract getProviderName(): string;

	protected get options(): T {
		return { ...this._config };
	}

	public abstract newClient(clientOptions: T): Promise<any>;

	public abstract publish(
		topics: string[] | string,
		msg: PubSubContent,
		options?: T
	): void;

	public abstract subscribe(
		topics: string[] | string,
		options?: T,
		customUserAgentDetails?: CustomUserAgentDetails
	): Observable<PubSubContent>;
}
