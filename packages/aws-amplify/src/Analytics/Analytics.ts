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
// let buffer_size = 1000;
// let MAX_SIZE_PER_FLUSH = BUFFER_SIZE * 0.1;
// let INTERVAL = 5 * 1000; // 5s
// let RESEND_LIMIT = 5;
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    private _pluggables: AnalyticsProvider[];
    private _disabled;
    private _timer;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor() {
        this._buffer = [];
        this._config = {
            clientInfo: ClientDevice.clientInfo(),
            bufferSize: 1000,
            maxSizePerFlush: 100,
            interval: 5 * 1000,
            resendLimits: 5
        };
        this._pluggables = [];
        this._disabled = false;
        this._setTimer();
    }
    
    private _setTimer() {
        if (this._timer) clearInterval(this._timer);

        const that = this;
        const { maxSizePerFlush, interval } = this._config;

        this._timer = setInterval(
            () => {
                const size = that._buffer.length < maxSizePerFlush ? that._buffer.length : maxSizePerFlush;
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

        this._config = conf;

        if (conf['disabled']) {
            this._disabled = true;
        }
        if (conf['interval'] || conf['maxSizePerFlush']) {
            this._setTimer();
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
        const { resendLimits } = this._config;
        const params = { eventName: '_session_start', timestamp, config: this._config, resendLimits };
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
        const { resendLimits } = this._config;
        const params = { eventName: '_session_stop', timestamp, config: this._config, resendLimits };
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
        const { resendLimits } = this._config;
        const params = { eventName, attributes, metrics, timestamp, config: this._config, resendLimits };
        return this._putToBuffer(params);
    }

    public async updateEndpoint(config) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const conf = Object.assign(this._config, config);
        const { resendLimits } = this._config;
        const params = { eventName: '_update_endpoint', timestamp, config: conf, resendLimits };
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
                        if (params.resendLimits > 0) {
                            params.resendLimits -= 1;
                            that._putToBuffer(params);
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
        const { bufferSize } = this._config;
        if (this._disabled) {
            logger.debug('Analytics has been disabled');
            return Promise.resolve();
        }
        if (this._buffer.length < bufferSize) {
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
