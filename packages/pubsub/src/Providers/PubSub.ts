// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable } from 'rxjs';
import { ConsoleLogger } from '@aws-amplify/core';

import {
	PubSubBase,
	PubSubContent,
	PubSubOptions,
	PublishInput,
	SubscribeInput,
} from '../types/PubSub';

const logger = new ConsoleLogger('AbstractPubSubProvider');

export abstract class AbstractPubSub<T extends PubSubOptions>
	implements PubSubBase
{
	private _config: T;

	constructor(options: T) {
		this._config = options;
	}

	configure(config: T): T {
		this._config = { ...config, ...this._config };

		logger.debug(`configure`, this._config);

		return this.options;
	}

	protected get options(): T {
		return { ...this._config };
	}

	public abstract newClient(clientOptions: T): Promise<any>;

	public abstract publish(input: PublishInput): void;

	public abstract subscribe(input: SubscribeInput): Observable<PubSubContent>;
}
