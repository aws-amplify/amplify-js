// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Observable from 'zen-observable-ts';
import { PubSubProvider, ProviderOptions } from '../types/Provider';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('AbstractPubSubProvider');

export abstract class AbstractPubSubProvider implements PubSubProvider {
	private _config: ProviderOptions;

	constructor(options: ProviderOptions = {}) {
		this._config = options;
	}

	configure(config: ProviderOptions = {}): ProviderOptions {
		this._config = { ...config, ...this._config };

		logger.debug(`configure ${this.getProviderName()}`, this._config);

		return this.options;
	}

	getCategory() {
		return 'PubSub';
	}

	abstract getProviderName(): string;

	protected get options(): ProviderOptions {
		return { ...this._config };
	}

	public abstract newClient(clientOptions: ProviderOptions): Promise<any>;

	public abstract publish(
		topics: string[] | string,
		msg: any,
		options?: ProviderOptions
	): void;

	public abstract subscribe(
		topics: string[] | string,
		options?: ProviderOptions
	): Observable<any>;
}
