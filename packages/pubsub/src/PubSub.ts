// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	removePluggable(providerName: string): void {
		this._pluggables = this._pluggables.filter(
			pluggable => pluggable.getProviderName() !== providerName
		);
	}

	private getProviderByName(providerName: string | symbol) {
		if (providerName === INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER) {
			return this.awsAppSyncProvider;
		}
		if (providerName === INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER) {
			return this.awsAppSyncRealTimeProvider;
		}

		return this._pluggables.find(
			pluggable => pluggable.getProviderName() === providerName
		);
	}

	private getProviders(options: ProviderOptions = {}) {
		const { provider: providerName } = options;
		if (!providerName) {
			return this._pluggables;
		}

		const provider = this.getProviderByName(providerName);
		if (!provider) {
			throw new Error(`Could not find provider named ${providerName}`);
		}

		return [provider];
	}

	async publish(
		topics: string[] | string,
		msg: any,
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
	): Observable<any> {
		if (isNode && this._options && this._options.ssr) {
			throw new Error(
				'Subscriptions are not supported for Server-Side Rendering (SSR)'
			);
		}

		logger.debug('subscribe options', options);

		const providers = this.getProviders(options);

		return new Observable(observer => {
			const observables = providers.map(provider => ({
				provider,
				observable: provider.subscribe(topics, options),
			}));

			const subscriptions = observables.map(({ provider, observable }) =>
				observable.subscribe({
					start: console.error,
					next: value => observer.next({ provider, value }),
					error: error => observer.error({ provider, error }),
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
