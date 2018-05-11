/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
    ClientDevice,
    ConsoleLogger as Logger,
    missingConfig,
    Parser
} from '../Common';
import AWSPinpointProvider from './Providers/AWSPinpointProvider';
import Platform from '../Common/Platform';
import Auth from '../Auth';

import { AnalyticsProvider, EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');

/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _provider;
    private _pluggables: AnalyticsProvider[];
    private _disabled;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor() {
        this._config = {};
        this._pluggables = [];
        this._disabled = false;
    }

    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    public configure(config) {
        logger.debug('configure Analytics');
        const amplifyConfig = Parser.parseMobilehubConfig(config);
        const conf = Object.assign({}, this._config, amplifyConfig.Analytics, config);

        const clientInfo:any = ClientDevice.clientInfo();
        conf['clientInfo'] = conf['client_info']? conf['client_info'] : clientInfo;

        this._config = conf;

        if (conf['disabled']) {
            this._disabled = true;
        }
        this._pluggables.map((pluggable) => {
            pluggable.configure(conf);
        });

        if (this._pluggables.length === 0) {
            this.addPluggable(new AWSPinpointProvider());
        }

        return conf;
    }

    /**
     * add plugin into Analytics category
     * @param {Object} pluggable - an instance of the plugin
     */
    public async addPluggable(pluggable: AnalyticsProvider) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        if (pluggable && pluggable.getCategory() === 'Analytics') {
            this._pluggables.push(pluggable);
            const config = pluggable.configure(this._config);
            return Promise.resolve(config);
        }
    }

    /**
     * stop sending events
     */
    public disable() {
        this._disabled = true;
    }

    /**
     * start sending events
     */
    public enable() {
        this._disabled = false;
    }

    /**
     * Record Session start
     * @return - A promise which resolves if buffer doesn't overflow
     */
    public async startSession(provider?: string) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = { event: '_session_start', timestamp, config: this._config, provider };
        return this._sendEvent(params);
    }

    /**
    * Receive a capsule from Hub
    * @param {any} capsuak - The message from hub
    */
   public onHubCapsule(capsule: any): void {}

    /**
     * Record Session stop
     * @return - A promise which resolves if buffer doesn't overflow
     */
    public async stopSession(provider?: string) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = { event: '_session_stop', timestamp, config: this._config, provider };
        return this._sendEvent(params);
    }

    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if buffer doesn't overflow
     */
    public async record(event: string | object, attributes?: EventAttributes, metrics?: EventMetrics) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        let provider = null;
        // for compatibility
        if (typeof event === 'string') {
            provider = 'AWSPinpoint';
        } else {
            provider = event['provider'];
        }
        const params = { event, attributes, metrics, timestamp, config: this._config, provider };
        return this._sendEvent(params);
    }

    public async updateEndpoint(config) {
        if (this._disabled) {
            logger.debug('Analytics has been disabled');
            return Promise.resolve();
        }

        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const conf = Object.assign(this._config, config);
        const params = { event: '_update_endpoint', timestamp, config: conf };

        // for compatibility
        const provider = config.provider? config.provider : 'AWSPinpoint';

        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === provider) {
                return pluggable.updateEndpoint(params);
            }
        });

        return Promise.reject('no available provider to update endpoint');
    }

    private _sendEvent(params) {
        if (this._disabled) {
            logger.debug('Analytics has been disabled');
            return Promise.resolve();
        }

        const provider = params.provider? params.provider: 'AWSPinpoint';
        
        this._pluggables.map((pluggable) => {
            if (pluggable.getProviderName() === provider) {
                pluggable.record(params);
            }
        });

        return Promise.resolve();
    }

    /**
     * @private
     * check if current credentials exists
     */
    private _getCredentials() {
        const that = this;
        return Auth.currentCredentials()
            .then(credentials => {
                if (!credentials) return false;
                const cred = Auth.essentialCredentials(credentials);

                that._config.credentials = cred;
                // that._config.endpointId = cred.identityId;
                // logger.debug('set endpointId for analytics', that._config.endpointId);
                logger.debug('set credentials for analytics', that._config.credentials);
                return true;
            })
            .catch(err => {
                logger.debug('ensure credentials error', err);
                return false;
            });
    }
}
