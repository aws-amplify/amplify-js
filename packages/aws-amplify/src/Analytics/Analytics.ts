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
    AMA,
    ClientDevice,
    ConsoleLogger as Logger,
    missingConfig,
    MobileAnalytics
} from '../Common';

import Auth from '../Auth';

import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');
const ama_logger = new Logger('AMA');
ama_logger.log = ama_logger.verbose;

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

    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions) {
        this.configure(config);

        const client_info:any = ClientDevice.clientInfo();
        if (client_info.platform) { this._config.platform = client_info.platform; }

        if (!this._config.endpointId) {
            if (window.localStorage) {
                let endpointId = window.localStorage.getItem('amplify_endpoint_id');
                if (!endpointId) {
                    endpointId = this._generateRandomString()
                    window.localStorage.setItem('amplify_endpoint_id', endpointId);
                }
                this._config.endpointId = endpointId;
            }
            else {
                this._config.endpointId = this._generateRandomString();
            }
        }

        this._buffer = [];
    }

    configure(config) {
        logger.debug('configure Analytics');
        let conf = config? config.Analytics || config : {};
        
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                platform: 'other'
            };
        }
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);
        if (!this._config.appId) { logger.debug('Do not have appId yet.'); }

        this._initClients();

        return this._config;
    }

    /**
     * Record Session start
     */
    async startSession() {
        logger.debug('record session start');
        const sessionId = this._generateRandomString();
        this._sessionId = sessionId;

        const clientContext = this._generateClientContext();
        const params = {
            clientContext,
            events: [
                {
                    eventType: '_session.start',
                    timestamp: new Date().toISOString(),
                    'session': {
                        'id': sessionId,
                        'startTimestamp': new Date().toISOString()
                    }
                }
            ]
        };
        this.mobileAnalytics.putEvents(params, (err, data) => {
            if (err) {
                logger.debug('record event failed. ' + err);
            }
            else {
                logger.debug('record event success. ');
                logger.debug(data);
            }
        });
    }

    /**
     * Record Session stop
     */
    async stopSession() {
        logger.debug('record session stop');
        const sessionId = this._sessionId ? this._sessionId : this._generateRandomString();
        const clientContext = this._generateClientContext();
        const params = {
            clientContext,
            events: [
                {
                    eventType: '_session.stop',
                    timestamp: new Date().toISOString(),
                    'session': {
                        'id': sessionId,
                        'startTimestamp': new Date().toISOString()
                    }
                }
            ]
        };
        this.mobileAnalytics.putEvents(params, (err, data) => {
            if (err) {
                logger.debug('record event failed. ' + err);
            }
            else {
                logger.debug('record event success. ');
                logger.debug(data);
            }
        });
    }

    /**
     * Restart Analytics client with credentials provided
     * @param {Object} credentials - Cognito Credentials
     */
    restart() {
        try {
            this.stopSession();
            this._initClients();
        } catch(e) {
            logger.debug('restart error', e);
        }
    }

    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    async record(name: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        logger.debug('record event ' + name);
        
        const clientContext = this._generateClientContext();
        const params = {
            clientContext,
            events: [
                {
                    eventType: name,
                    timestamp: new Date().toISOString(),
                    attributes,
                    metrics
                }
            ]
        };
        this.mobileAnalytics.putEvents(params, (err, data) => {
            if (err) {
                logger.debug('record event failed. ' + err);
            }
            else {
                logger.debug('record event success. ');
                logger.debug(data);
            }
        });
    }

    /**
    * Record one analytic event
    * @param {String} name - Event name
    * @param {Object} [attributes] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    // async recordMonetization(name, attributes?: EventAttributes, metrics?: EventMetrics) {
    //     this.amaClient.recordMonetizationEvent(name, attributes, metrics);
    // }

    _generateClientContext() {
        const { endpointId, appId } = this._config;
        const clientContext = {
            client: {
                client_id: endpointId
            },
            services: {
                mobile_analytics: {
                    app_id: appId
                }
            }
        };
        return JSON.stringify(clientContext);
    }

    _generateRandomString() {
        let result = '';
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	for (let i = 32; i > 0; i -= 1) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    	return result;
    }

    _checkConfig() {
        return !!this._config.appId;
    }

    _ensureCredentials() {
        const conf = this._config;
        // commented
        // will cause bug if another user logged in without refreshing page
        // if (conf.credentials) { return Promise.resolve(true); }

        return Auth.currentCredentials()
            .then(credentials => {
                const cred = Auth.essentialCredentials(credentials);
                logger.debug('set credentials for analytics', cred);
                conf.credentials = cred;

                return true;
            })
            .catch(err => {
                logger.debug('ensure credentials error', err);
                return false;
            });
    }

    async _initClients() {
        if (!this._checkConfig()) { return false; }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return false; }

        this._initMobileAnalytics();
        this._initPinpoint();
        this.startSession();
    }

    _initMobileAnalytics() {
        const { credentials, region } = this._config;
        this.mobileAnalytics = new MobileAnalytics({ credentials, region });
    }


    /**
     * Init Pinpoint with configuration and update pinpoint client endpoint
     */
    _initPinpoint() {
        const { region, appId, endpointId, credentials } = this._config;
        this.pinpointClient = new Pinpoint({
            region,
            credentials,
        });

        const request = this._endpointRequest();
        const update_params = {
            ApplicationId: appId,
            EndpointId: endpointId,
            EndpointRequest: request
        };
        logger.debug(update_params);

        this.pinpointClient.updateEndpoint(update_params, function(err, data) {
            if (err) {
                logger.debug('Pinpoint ERROR', err);
            } else {
                logger.debug('Pinpoint SUCCESS', data);
            }
        });
    }

    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    _endpointRequest() {
        const client_info: any = ClientDevice.clientInfo();
        const credentials = this._config.credentials;
        const user_id = credentials.authenticated? credentials.identityId : null;
        logger.debug('demographic user id: ' + user_id);
        return {
            Demographic: {
                AppVersion: this._config.appVersion || client_info.appVersion,
                Make: client_info.make,
                Model: client_info.model,
                ModelVersion: client_info.version,
                Platform: client_info.platform
            },
            User: { UserId: user_id }
        };
    }
}
