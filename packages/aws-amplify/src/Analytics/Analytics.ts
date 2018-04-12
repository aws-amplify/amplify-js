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
import AWSAnalyticsProvider from './Providers/AWSAnalyticsProvider';
import Platform from '../Common/Platform';
import Auth from '../Auth';

import { AnalyticsProvider, EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');

// events buffer
const BUFFER_SIZE = 1000;
const MAX_SIZE_PER_FLUSH = BUFFER_SIZE * 0.1;
const interval = 5*1000; // 5s
const RESEND_LIMIT = 5;
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    private _pluggables: AnalyticsProvider[];
    private _disabled;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor() {
        this._buffer = [];
        this._config = {};
        this._pluggables = [];
        this._disabled = false;
        // default one

        // events batch
        const that = this;

        // flush event buffer
        setInterval(
            () => {
                const size = this._buffer.length < MAX_SIZE_PER_FLUSH ? this._buffer.length : MAX_SIZE_PER_FLUSH;
                for (let i = 0; i < size; i += 1) {
                    const params = this._buffer.shift();
                    that._sendFromBuffer(params);
                }
            },
            interval);
    }

    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    public configure(config) {
        logger.debug('configure Analytics');
        const amplifyConfig = Parser.parseMobilehubConfig(config);
        const conf = Object.assign({}, this._config, amplifyConfig.Analytics);

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
            this.addPluggable(new AWSAnalyticsProvider());
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

        if (pluggable) {
            this._pluggables.push(pluggable);
            // pluggable.configure(this._config);
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
    public async startSession() {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = { eventName: '_session_start', timestamp, config: this._config };
        return this._putToBuffer(params);
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
    public async stopSession() {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = { eventName: '_session_stop', timestamp, config: this._config };
        return this._putToBuffer(params);
    }

    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if buffer doesn't overflow
     */
    public async record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = { eventName, attributes, metrics, timestamp, config: this._config };
        return this._putToBuffer(params);
    }

    public async updateEndpoint(config) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const conf = Object.assign(this._config, config);
        const params = { eventName: '_update_endpoint', timestamp, config: conf };
        return this._putToBuffer(params);
    }

    /**
     * @private
     * @param {Object} params - params for the event recording
     * Send events from buffer
     */
    private _sendFromBuffer(params) {
        const that = this;
        this._pluggables.map((pluggable) => {
            pluggable.record(params)
                .then(success => {
                    if (!success) {
                        params.resendLimits = typeof params.resendLimits === 'number' ? 
                            params.resendLimits : RESEND_LIMIT;
                        if (params.resendLimits > 0) {
                            logger.debug(
                                `resending event ${params.eventName} with ${params.resendLimits} retry times left`);
                            params.resendLimits -= 1;
                            that._putToBuffer(params);
                        } else {
                            logger.debug(`retry times used up for event ${params.eventName}`);
                        }
                    }
                });
        });
    }

    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    private _putToBuffer(params) {
        if (this._disabled) {
            logger.debug('Analytics has been disabled');
            return Promise.resolve();
        }
        if (this._buffer.length < BUFFER_SIZE) {
            this._buffer.push(params);
            return Promise.resolve();
        }
        else return Promise.reject('exceed buffer size');
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
