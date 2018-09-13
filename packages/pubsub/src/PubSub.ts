/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// import '../Common/Polyfills';
import * as Observable from 'zen-observable';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PubSubProvider, PubSubOptions, ProvidertOptions } from './types';
import { AWSAppSyncProvider } from './Providers';

const logger = new Logger('PubSub');

export default class PubSub {

    private _options: PubSubOptions;

    private _pluggables: PubSubProvider[];

    /**
     * Initialize PubSub with AWS configurations
     * 
     * @param {PubSubOptions} options - Configuration object for PubSub
     */
    constructor(options: PubSubOptions) {
        this._options = options;
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
        const opt = options ? options.PubSub || options : {};
        logger.debug('configure PubSub', { opt });

        this._options = Object.assign({}, this._options, opt);

        if (this._options.aws_appsync_graphqlEndpoint && this._options.aws_appsync_region &&
            !this._pluggables.find(p => p.getProviderName() === 'AWSAppSyncProvider')) {
            this.addPluggable(new AWSAppSyncProvider());
        }

        this._pluggables.map((pluggable) => pluggable.configure(this._options));

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

    async publish(topics: string[] | string, msg: any, options: ProvidertOptions) {
        return this._pluggables.map(provider => provider.publish(topics, msg, options));
    }

    subscribe(topics: string[] | string, options: ProvidertOptions): Observable<any> {
        logger.debug('subscribe options', options);

        return new Observable(observer => {
            const observables = this._pluggables.map(provider => ({
                provider,
                observable: provider.subscribe(topics, options),
            }));

            const subscriptions = observables.map(({ provider, observable }) => observable.subscribe({
                start: console.error,
                next: value => observer.next({ provider, value }),
                error: error => observer.error({ provider, error }),
                // complete: observer.complete, // TODO: when all completed, complete the outer one
            }));

            return () => subscriptions.forEach(subscription => subscription.unsubscribe());
        });
    }
}
