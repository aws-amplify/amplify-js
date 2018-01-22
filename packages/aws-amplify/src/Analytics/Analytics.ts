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
import AWSAnalyticsProvider from './Providers/AWSAnalyticsProvider';
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

    private _provider;

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions) {
        this._buffer = [];

        this._setProvider('AWS');
    }

    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    public configure(config) {
        logger.debug('configure Analytics');
        let conf = config? config.Analytics || config : {};

        const { provider } = conf;
        this._setProvider(provider);

        const clientInfo:any = ClientDevice.clientInfo();
        conf.clientInfo = conf.client_info? conf.client_info : clientInfo;

        this._config = conf;
        this._initClients();
        return conf;
    }

    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    public startSession() {
        return this._provider.putEvent({eventName: 'session_start'});
    }

    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    public stopSession() {
        return this._provider.putEvent({eventName: 'session_stop'});
    }

    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if event record successfully
     */
    public record(eventName: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        return this._provider.putEvent({eventName, attributes, metrics});
    }

    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise ehich resolves to be true if current credential exists
     */
    async restart() {
        return this._initClients();
    }

    /**
     * @private
     * check if current crednetials exists
     */
    private _ensureCredentials() {
        const _analytics = this;
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

    /**
     * @private
     * set the Analytics client
     * @param provider 
     */
    private _setProvider(provider) {
        const list = {AWS: AWSAnalyticsProvider}
        // look into provider list
        if (provider in list) {
        
            this._provider = list[provider];
        }
    }

    /**
     * @private
     * @async
     * init clients for Anlytics including mobile analytics and pinpoint
     * @return - True if initilization succeeds
     */
    private async _initClients() {
        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return false; }
   
        logger.debug('init clients with config', this._config);
        return this._provider.initClients(this._config);
    }
}
