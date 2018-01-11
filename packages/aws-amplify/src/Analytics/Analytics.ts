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
import Cache from '../Cache';

import { AnalyticsOptions, SessionState, EventAttributes, EventMetrics } from './types';

const logger = new Logger('AnalyticsClass');
const NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];
const CACHE_EVENT_LIMIT = 200;
const CACHE_EVENT_ID_RANGE = 1000000;

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
    private _storage;


    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    constructor(config: AnalyticsOptions) {
        this.configure(config);

        const client_info:any = ClientDevice.clientInfo();
        if (client_info.platform) { this._config.platform = client_info.platform; }

        // store endpointId into localstorage
        if (!this._config.endpointId) {
            /*
            if (window.localStorage) {
                let endpointId = window.localStorage.getItem('amplify_endpoint_id');
                if (!endpointId) {
                    endpointId = this.generateRandomString();
                    window.localStorage.setItem('amplify_endpoint_id', endpointId);
                }
                this._config.endpointId = endpointId;
            }
            else {
                this._config.endpointId = this.generateRandomString();
            }*/
            const credentials = this._config.credentials;
            if (credentials && credentials.identityId) {
                this._config.endpointId = credentials.identityId;
            }
        }

        this._buffer = [];
    }

    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    public configure(config) {
        logger.debug('configure Analytics');
        let conf = config? config.Analytics || config : {};
        
        // using app_id from aws-exports if provided
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                platform: 'other'
            };
        }
        // hard code region
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);

        // no app id provided
        if (!this._config.appId) { logger.debug('Do not have appId yet.'); }

        // async init clients
        this._initClients();

        return this._config;
    }

    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    public startSession() {
        logger.debug('record session start');
        const sessionId = this.generateRandomString();
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
        return new Promise<any>((res,rej) => {
            this.mobileAnalytics.putEvents(params, this._putEventsCallback(params, res, rej));
        });
    }

    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    public stopSession() {
        logger.debug('record session stop');
        
        const sessionId = this._sessionId ? this._sessionId : this.generateRandomString();
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
        return new Promise<any>((res,rej) => {
            this.mobileAnalytics.putEvents(params, this._putEventsCallback(params, res, rej));
        });
    }

    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise ehich resolves to be true if current credential exists
     */
    async restart() {
        this.stopSession().then((data) => {
                return this._initClients();
            }).catch(e => {
                logger.debug('restart error', e);
            });
    }

    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    * @return - A promise which resolves if event record successfully
    */
    public record(name: string, attributes?: EventAttributes, metrics?: EventMetrics) {
        logger.debug(`record event: { name: ${name}, attributes: ${attributes}, metrics: ${metrics}`);
        
        // if mobile analytics client not ready, buffer it
        if (!this.mobileAnalytics) {
            logger.debug('mobileAnalytics not ready, put in buffer');
            this._buffer.push({
                name,
                attributes,
                metrics
            });
            return;
        }

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

        return new Promise<any>((res,rej) => {
            this.mobileAnalytics.putEvents(params, this._putEventsCallback(params, res, rej));
        });
    }

    /**
     * @private
     * Callback function for MobileAnalytics putEvents
     */
    _putEventsCallback(params, res, rej) {
        return (err, data) => {
            if (err) {
                logger.debug('record event failed. ' + err);
                if (err.statusCode === undefined || err.statusCode === 400){
                    if (err.code === 'ThrottlingException') {
                        logger.debug('get throttled, caching events');
                        this._cacheEvents(params);
                    }
                }
                rej(err);
            }
            else {
                logger.debug('record event success. ' + data);
                this._submitCachedEvents();
                res(data);
            }
        };
    }

    /**
     * @private
     * Submit cached events if put events succeeded
     */
    async _submitCachedEvents() {
        const { endpointId, appId, credentials } = this._config;
        const key = 'amplify_analytics_events_' + appId + 
            (credentials && credentials.authenticated? '_' + endpointId : '');

        const cachedEvents = await Cache.getItem(key);
        if (cachedEvents && cachedEvents['length'] !== 0) {
            // get the first cached event
            const first_item_id = (cachedEvents['last_item_id'] 
                - cachedEvents['length'] + 1 
                + cachedEvents['max_item_id']) 
                % cachedEvents['max_item_id'];
            
            const params = cachedEvents[first_item_id];
            logger.debug(`getting cached event No.${first_item_id} with params: `);
            logger.debug(params);
            // delete the event and restore cached events into cache
            cachedEvents['length'] -= 1;
            delete cachedEvents[first_item_id];

            await Cache.setItem(key, cachedEvents);
            return new Promise((res, rej) => {
                this.mobileAnalytics.putEvents(params, this._putEventsCallback(params, res, rej));
            });
        }
    }

    /**
     * @private
     * Cache events into the storage provided 
     */
    async _cacheEvents(params) {
        const { endpointId, appId, credentials } = this._config;
        const key = 'amplify_analytics_events_' + appId + 
            (credentials && credentials.authenticated? '_' + endpointId : '');

        let cachedEvents = await Cache.getItem(key);

        if (cachedEvents) {
            if (cachedEvents['length'] > CACHE_EVENT_LIMIT) {
                logger.debug('exceed limit of cached events. dumping it');
                return;
            }
            cachedEvents['length'] += 1;
            cachedEvents['last_item_id'] = (cachedEvents['last_item_id'] + 1) % cachedEvents['max_item_id'];
            cachedEvents[cachedEvents['last_item_id']] = params;
        } else {
            cachedEvents = {};
            cachedEvents['length'] = 1;
            cachedEvents['last_item_id'] = 0;
            cachedEvents['max_item_id'] = CACHE_EVENT_ID_RANGE;
            cachedEvents[cachedEvents['last_item_id']] = params;
        }

        await Cache.setItem(key, cachedEvents);
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


    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
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

    /**
     * generate random string
     */
    generateRandomString() {
        let result = '';
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	for (let i = 32; i > 0; i -= 1) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    	return result;
    }

    /**
     * @private
     * check if app Id exists
     */
    _checkConfig() {
        return !!this._config.appId;
    }

    /**
     * @private
     * check if current crednetials exists
     */
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

                if (!conf.endpointId && conf.credentials) {
                    conf.endpointId = conf.credentials.identityId;
                }

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
        if (!this._checkConfig()) { return false; }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return false; }

        this._initMobileAnalytics();
        await this._initPinpoint();
        this.startSession();

        return true;
    }

    /**
     * @private
     * Init mobile analytics and clear buffer
     */
    _initMobileAnalytics() {
        const { credentials, region } = this._config;
        this.mobileAnalytics = new MobileAnalytics({ credentials, region });

        if (this._buffer.length > 0) {
            logger.debug('something in buffer, flush it');
            const buffer = this._buffer;
            this._buffer = [];
            buffer.forEach(event => {
                this.record(event.name, event.attributes, event.metrics);
            });
        }
    }


    /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
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

        return new Promise((res, rej) => {
            this.pinpointClient.updateEndpoint(update_params, function(err, data) {
                if (err) {
                    logger.debug('Pinpoint ERROR', err);
                    rej(err);
                } else {
                    logger.debug('Pinpoint SUCCESS', data);
                    res(data);
                }
            });
        });
    }

    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    _endpointRequest() {
        const client_info: any = ClientDevice.clientInfo();
        const credentials = this._config.credentials;
        const user_id = (credentials && credentials.authenticated) ? credentials.identityId : null;
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
