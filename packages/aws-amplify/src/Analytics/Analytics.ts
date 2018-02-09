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
import Auth from '../Auth';

import { EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');
const BUFFER_SIZE = 1000;
const MAX_SIZE_PER_FLUSH = BUFFER_SIZE * 0.1;
const interval = 2*1000; // 2s
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;
    private _buffer;
    private _provider;
    private _pluggables;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor() {
        this._buffer = [];
        this._config = {};
        this._pluggables = [];
        // default one
        this._pluggables.push(new AWSAnalyticsProvider());

        // events batch
        const that = this;

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
        const conf = Object.assign({}, this._config, Parser.parseMobilehubConfig(config).Analytics);

        const clientInfo:any = ClientDevice.clientInfo();
        conf['clientInfo'] = conf['client_info']? conf['client_info'] : clientInfo;

        this._config = conf;

        this._pluggables.map((pluggable) => {
            pluggable.configure(conf);
        });
        return conf;
    }

    public addPluggable(pluggable) {
        if (pluggable) {
            this._pluggables.push(pluggable);
            pluggable.configure(this._config);
        }
    }

    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    public async startSession() {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = {eventName: '_session_start', timestamp, config: this._config};
        return this._putToCache(params);
    }

    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    public async stopSession() {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = {eventName: '_session_stop', timestamp, config: this._config};
        return this._putToCache(params);
    }

    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if event record successfully
     */
    public async record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        const ensureCredentails = await this._getCredentials();
        if (!ensureCredentails) return Promise.resolve(false);

        const timestamp = new Date().getTime();
        const params = {eventName, attributes, metrics, timestamp, config: this._config};
        return this._putToCache(params);
    }

    private _sendFromBuffer(params) {
        const that = this;
        this._pluggables.map((pluggable) => {
            pluggable.record(params)
                .then(success => {
                    if (!success) {
                        that._putToCache(params);
                    }
                });
        });
    }

    private _putToCache(params) {
        if (this._buffer.length < BUFFER_SIZE) {
            this._buffer.push(params);
            return Promise.resolve();
        }
        else return Promise.reject('exceed buffer size');
    }

    /**
     * @private
     * check if current crednetials exists
     */
    private _getCredentials() {
        const conf = this._config;

        return Auth.currentCredentials()
            .then(credentials => {
                const cred = Auth.essentialCredentials(credentials);

                conf.credentials = cred;
                conf.endpointId = conf.credentials.identityId;
                logger.debug('set endpointId for analytics', conf.endpointId);
                logger.debug('set credentials for analytics', conf.credentials);

                return true;
            })
            .catch(err => {
                logger.debug('ensure credentials error', err);
                return false;
            });
    }
}
