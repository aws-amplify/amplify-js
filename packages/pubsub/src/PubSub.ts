// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// import '../Common/Polyfills';
import Observable from 'zen-observable-ts';

import {
	Amplify,
	browserOrNode,
	ConsoleLogger as Logger,
	INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
} from '@aws-amplify/core';
import { PubSubProvider, PubSubOptions, ProviderOptions } from './types';
import { AWSAppSyncRealTimeProvider } from './Providers';
import { PubSubContent } from './types/PubSub';

const { isNode } = browserOrNode();
const logger = new Logger('PubSub');

type PubSubObservable = {
	provider: PubSubProvider;
	value: string | Record<string, unknown>;
};

export class PubSubClass {
	private _options: PubSubOptions;

	private _pluggables: PubSubProvider[];

	/**
	 * Internal instance of AWSAppSyncRealTimeProvider used by the API category to subscribe to AppSync
	 */
	private _awsAppSyncRealTimeProvider?: AWSAppSyncRealTimeProvider;

	/**
	 * Lazy instantiate AWSAppSyncRealTimeProvider when it is required by the API category
	 */
	private get awsAppSyncRealTimeProvider() {
		if (!this._awsAppSyncRealTimeProvider) {
			this._awsAppSyncRealTimeProvider = new AWSAppSyncRealTimeProvider(
				this._options
			);
		}
		return this._awsAppSyncRealTimeProvider;
	}

	/**
	 * Initialize PubSub with AWS configurations
	 *
	 * @param {PubSubOptions} options - Configuration object for PubSub
	 */
	constructor(options?: PubSubOptions) {
		this._options = options ?? {};
		logger.debug('PubSub Options', this._options);
		this._pluggables = [];
		this.subscribe = this.subscribe.bind(this);
	}

	public getModuleName() {
		return 'PubSub';
	}

	/**
	 * Configure PubSub part with configurations
	 *
	 * @param {PubSubOptions} config - Configuration for PubSub
	 * @return {Object} - The current configuration
	 */
	configure(options: PubSubOptions) {
		const opt: Record<string, unknown> = options
			? options.PubSub || options
			: {};
		logger.debug('configure PubSub', { opt });

		this._options = Object.assign({}, this._options, opt);

		this._pluggables.map(pluggable => pluggable.configure(this._options));

		return this._options;
	}

	/**
	 * add plugin into Analytics category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	public async addPluggable(pluggable: PubSubProvider) {
		if (pluggable && pluggable.getCategory() === 'PubSub') {
			this._pluggables.push(pluggable);

			const config = pluggable.configure(this._options);

			return config;
		}
	}

	/**
	 * remove plugin from PubSub category
	 * @param providerName - the name of the plugin
	 */
	removePluggable(providerName: string): void {
		this._pluggables = this._pluggables.filter(
			pluggable => pluggable.getProviderName() !== providerName
		);
	}

	private getProviderByName(providerName: string | symbol) {
		if (providerName === INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER) {
			return this.awsAppSyncRealTimeProvider;
		}

		return this._pluggables.find(
			pluggable => pluggable.getProviderName() === providerName
		);
	}

	private getProviders(options: ProviderOptions = {}) {
		const providerName = options.provider;
		if (!providerName) {
			return this._pluggables;
		}

		const provider = this.getProviderByName(providerName);
		if (!provider) {
			throw new Error(`Could not find provider named ${String(providerName)}`);
		}

		return [provider];
	}

	async publish(
		topics: string[] | string,
		msg: PubSubContent,
		options?: ProviderOptions
	) {
		return Promise.all(
			this.getProviders(options).map(provider =>
				provider.publish(topics, msg, options)
			)
		);
	}

	subscribe(
		topics: string[] | string,
		options?: ProviderOptions
	): Observable<PubSubObservable> {
		if (isNode && this._options && this._options.ssr) {
			throw new Error(
				'Subscriptions are not supported for Server-Side Rendering (SSR)'
			);
		}

		logger.debug('subscribe options', options);

		const providers = this.getProviders(options);

		return new Observable<PubSubObservable>(observer => {
			const observables = providers.map(provider => ({
				provider,
				observable: provider.subscribe(topics, options),
			}));

			const subscriptions = observables.map(({ provider, observable }) =>
				observable.subscribe({
					start: console.error,
					next: (value: PubSubContent) => observer.next({ provider, value }),
					error: (error: unknown) => observer.error({ provider, error }),
					// complete: observer.complete, // TODO: when all completed, complete the outer one
				})
			);

			return () =>
				subscriptions.forEach(subscription => subscription.unsubscribe());
		});
	}
}

export const PubSub = new PubSubClass();
Amplify.register(PubSub);
