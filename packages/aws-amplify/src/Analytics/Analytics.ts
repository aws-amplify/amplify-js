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
    Pinpoint,
    ClientDevice,
    ConsoleLogger as Logger,
    missingConfig,
    MobileAnalytics
} from '../Common';

import Auth from '../Auth';

import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');
const NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];
/**
* Provide mobile analytics client functions
*/
export default class AnalyticsClass {
    private _config;

    private amaClient: any;
    private pinpointClient: any;

    private _buffer;

    private mobileAnalytics;
    private _sessionId;

    public provider;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions) {
        this._buffer = [];

        this.provider = AWSAnalyticsProvider;
    }

    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    public configure(config) {
        logger.debug('configure Analytics');
        let conf = config? config.Analytics || config : {};

        const { provider } = conf;
        if (provider) {
            this._setProvider(provider);
        }

        const client_info:any = ClientDevice.clientInfo();
        conf.client_info = conf.client_info? conf.client_info : client_info;

        this.provider.configure(conf);
        this._config = conf;
        return conf;
    }

    private _setProvider(provider) {
        // look into provider list
    }

    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    public startSession() {
        this.provider.putEvent({eventName: 'session_start'});
    }

    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    public stopSession() {
        this.provider.putEvent({eventName: 'session_stop'});
    }

    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if event record successfully
     */
    public record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        this.provider.putEvent({eventName, attributes, metrics});
    }

    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise ehich resolves to be true if current credential exists
     */
    async restart() {
        this.stopSession().then((data) => {
                logger.debug('restarting clients');
                return this._initClients();
            }).catch(e => {
                logger.debug('restart error', e);
            });
    }

    /**
     * @private
     * check if current crednetials exists
     */
    _ensureCredentials() {
        const _analytics = this;
        const conf = this._config;

        return Auth.currentCredentials()
            .then(credentials => {
                const cred = Auth.essentialCredentials(credentials);
                
                conf.credentials = cred;
                conf.endpointId = conf.credentials.identityId;
                _analytics.provider.configure(conf);

                logger.debug('set endpointId for analytics', conf.endpointId);
                logger.debug('set credentials for analytics', conf.credentials);

                return true;
            })
            .catch(err => {
                logger.debug('ensure credentials error', err);
                return false;
            });
    }

    /**
     * @private
     * @async
     * init clients for Anlytics including mobile analytics and pinpoint
     * @return - True if initilization succeeds
     */
    async _initClients() {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return false; }

        after init clients
        this.startSession();
   
        
        return true;
    }
}
