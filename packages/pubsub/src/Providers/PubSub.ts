// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable } from 'rxjs';
import { PubSubBase, PubSubOptions, PubSubContent } from '../types/PubSub';
import {
	ConsoleLogger as Logger,
	CustomUserAgentDetails,
} from '@aws-amplify/core/internals/utils';

const logger = new Logger('AbstractPubSubProvider');

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
