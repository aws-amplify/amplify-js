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
    ConsoleLogger as Logger, 
    ClientDevice, 
    Platform, 
    Credentials
} from '@aws-amplify/core';
import * as MobileAnalytics from 'aws-sdk/clients/mobileanalytics';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';

import Cache from '@aws-amplify/cache';

import { AnalyticsProvider } from '../types';
import { v1 as uuid } from 'uuid';

const logger = new Logger('AWSPinpointProvider');
const NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];

// events buffer
const BUFFER_SIZE = 1000;
const FLUSH_SIZE = 100;
const FLUSH_INTERVAL = 5*1000; // 5s
const RESEND_LIMIT = 5;

// params: { event: {name: , .... }, timeStamp, config, resendLimits }
export default class AWSPinpointProvider implements AnalyticsProvider {
    static category = 'Analytics';
    static providerName = 'AWSPinpoint';

    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;
    private _buffer;
    private _clientInfo;

    private _timer;

    constructor(config?) {
        this._buffer = [];
        this._config = config? config : {};
        this._config.bufferSize = this._config.bufferSize || BUFFER_SIZE;
        this._config.flushSize = this._config.flushSize || FLUSH_SIZE;
        this._config.flushInterval = this._config.flushInterval || FLUSH_INTERVAL;
        this._config.resendLimit = this._config.resendLimit || RESEND_LIMIT;
        this._clientInfo = ClientDevice.clientInfo();

        // flush event buffer
        this._setupTimer();
    }

    private _setupTimer() {
        if (this._timer) {
            clearInterval(this._timer);
        }
        const { flushSize, flushInterval } = this._config;
        const that = this;
        this._timer = setInterval(
            () => {
                const size = this._buffer.length <  flushSize? this._buffer.length : flushSize;
                for (let i = 0; i < size; i += 1) {
                    const params = this._buffer.shift();
                    that._sendFromBuffer(params);
                } 
            },
            flushInterval
        );
    }

    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    private _putToBuffer(params) {
        const { bufferSize } = this._config;
        if (this._buffer.length < bufferSize) {
            this._buffer.push(params);
            return Promise.resolve(true);
        } else {
            logger.debug('exceed analytics events buffer size');
            return Promise.reject(false);
        }
    }

    private async _sendFromBuffer(params) {
        const { event, config } = params;

        const { appId, region, resendLimit } = config;
        const cacheKey = this.getProviderName() + '_' + appId;
        config.endpointId = config.endpointId? config.endpointId : await this._getEndpointId(cacheKey);

        let success = true;
        switch (event.name) {
            case '_session_start':
                success = await this._startSession(params);
                break;
            case '_session_stop':
                success = await this._stopSession(params);
                break;
            case '_update_endpoint':
                success = await this._updateEndpoint(params);
                break;
            default:
                success = await this._recordCustomEvent(params);
                break;
        }
        
        if (!success) {
            params.resendLimits = typeof params.resendLimits === 'number' ? 
                params.resendLimits : resendLimit;
            if (params.resendLimits > 0) {
                logger.debug(
                    `resending event ${params.eventName} with ${params.resendLimits} retry times left`);
                params.resendLimits -= 1;
                this._putToBuffer(params);
            } else {
                logger.debug(`retry times used up for event ${params.eventName}`);
            }
        }
    }

    /**
     * get the category of the plugin
     */
    getCategory(): string {
        return AWSPinpointProvider.category;
    }

    /**
     * get provider name of the plugin
     */
    getProviderName(): string {
        return AWSPinpointProvider.providerName;
    }

    /**
     * configure the plugin
     * @param {Object} config - configuration
     */
    public configure(config): object {
        logger.debug('configure Analytics', config);
        const conf = config? config : {};
        this._config = Object.assign({}, this._config, conf);

        this._setupTimer();
        return this._config;
    }

    /**
     * record an event
     * @param {Object} params - the params of an event
     */
    public async record(params): Promise<boolean> {
        const credentials = await this._getCredentials();
        if (!credentials || !this._config['appId'] || !this._config['region']){
            logger.debug('cannot send events without credentials, applicationId or region');
            return Promise.resolve(false);
        } 
        const timestamp = new Date().getTime();

        Object.assign(params, { timestamp, config: this._config, credentials });
        return this._putToBuffer(params);
    }

    /**
     * @private
     * @param params 
     */
    private async _startSession(params) {
        // credentials updated
        const { timestamp, config, credentials } = params;

        this._initClients(config, credentials);

        logger.debug('record session start');
        this._sessionId = uuid();
        const sessionId = this._sessionId;
        
        const clientContext = this._generateClientContext(config);
        const eventParams = {
            clientContext,
            events: [
                {
                    eventType: '_session.start',
                    timestamp: new Date(timestamp).toISOString(),
                    'session': {
                        'id': sessionId,
                        'startTimestamp': new Date(timestamp).toISOString()
                    }
                }
            ]
        };
        

        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(eventParams, (err, data) => {
                if (err) {
                    logger.debug('record event failed. ', err);
                    res(false);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(true);
                }
            });
        });
    }

    /**
     * @private
     * @param params 
     */
    private async _stopSession(params) {
        // credentials updated
        const { timestamp, config, credentials } = params;

        this._initClients(config, credentials);

        logger.debug('record session stop');
    
        const sessionId = this._sessionId ? this._sessionId : uuid();
        const clientContext = this._generateClientContext(config);
        const eventParams = {
            clientContext,
            events: [
                {
                    eventType: '_session.stop',
                    timestamp: new Date(timestamp).toISOString(),
                    'session': {
                        'id': sessionId,
                        'startTimestamp': new Date(timestamp).toISOString()
                    }
                }
            ]
        };
        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(eventParams, (err, data) => {
                if (err) {
                    logger.debug('record event failed. ', err);
                    res(false);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(true);
                }
            });
        });
    }

    private async _updateEndpoint(params) : Promise<boolean> {
        // credentials updated
        const { timestamp, config, credentials, event } = params;
        const { appId, region, endpointId } = config;

        this._initClients(config, credentials);
        
        const request = this._endpointRequest(config, event);
        const update_params = {
            ApplicationId: appId,
            EndpointId: endpointId,
            EndpointRequest: request
        };

        const that = this;
        logger.debug('updateEndpoint with params: ', update_params);
        return new Promise<boolean>((res, rej) => {
            that.pinpointClient.updateEndpoint(update_params, (err, data) => {
                if (err) {
                    logger.debug('updateEndpoint failed', err);
                    res(false);
                } else {
                    logger.debug('updateEndpoint success', data);
                    res(true);
                }
            });
        });
    }

    /**
     * @private
     * @param params 
     */
    private async _recordCustomEvent(params) {
        // credentials updated
        const { event, timestamp, config, credentials } = params;
        const { name, attributes, metrics } = event;

        this._initClients(config, credentials);
        
        const clientContext = this._generateClientContext(config);
        const eventParams = {
            clientContext,
            events: [
                {
                    eventType: name,
                    timestamp: new Date(timestamp).toISOString(),
                    attributes,
                    metrics
                }
            ]
        };

        logger.debug('record event with params', eventParams);
        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(eventParams, (err, data) => {
                if (err) {
                    logger.debug('record event failed. ', err);
                    res(false);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(true);
                }
            });
        });
    }

    /**
     * @private
     * @param config 
     * Init the clients
     */
    private async _initClients(config, credentials) {
        logger.debug('init clients');

        if (this.mobileAnalytics 
            && this.pinpointClient
            && this._config.credentials
            && this._config.credentials.sessionToken === credentials.sessionToken
            && this._config.credentials.identityId === credentials.identityId) {
            logger.debug('no change for aws credentials, directly return from init');
            return;
        }

        this._config.credentials = credentials;
        const { region } = config;
        logger.debug('init clients with credentials', credentials);
        this.mobileAnalytics = new MobileAnalytics({ credentials, region });
        this.pinpointClient = new Pinpoint({ region, credentials });
    }

    private async _getEndpointId(cacheKey) {
        // try to get from cache
        let endpointId = await Cache.getItem(cacheKey);
        logger.debug('endpointId from cache', endpointId, 'type', typeof endpointId);
        if (!endpointId) {
            endpointId = uuid();
            Cache.setItem(cacheKey, endpointId);
        }
        return endpointId;
    }

    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    private _endpointRequest(config, event) {
        const { credentials } = config;
        const clientInfo = this._clientInfo;
        const {
            Address, 
            RequestId, 
            Attributes,
            UserAttributes,
            UserId,
            OptOut
        } = event;

        const ChannelType = Address? ((clientInfo.platform === 'android') ? 'GCM' : 'APNS') : undefined;

        const ret = {
            Address,
            Attributes,
            ChannelType,
            Demographic: {
                AppVersion: event.appVersion || clientInfo.appVersion,
                Make: clientInfo.make,
                Model: clientInfo.model,
                ModelVersion: clientInfo.version,
                Platform: clientInfo.platform
            },
            OptOut,
            RequestId,
            EffectiveDate: Address? new Date().toISOString() : undefined,
            User: { 
                UserId: UserId? UserId: credentials.identityId,
                UserAttributes
            }
        };
        return ret;
    }

    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    private _generateClientContext(config) {
        const { endpointId, appId } = config;

        const clientContext = config.clientContext || {};
        const clientInfo = this._clientInfo;
        const clientCtx = {
            client: {
                client_id: clientContext.clientId || endpointId,
                app_title: clientContext.appTitle,
                app_version_name: clientContext.appVersionName,
                app_version_code: clientContext.appVersionCode,
                app_package_name: clientContext.appPackageName,
            },
            env: {
                platform: clientContext.platform || clientInfo.platform,
                platform_version: clientContext.platformVersion || clientInfo.version,
                model: clientContext.model || clientInfo.model,
                make: clientContext.make || clientInfo.make,
                locale: clientContext.locale
            },
            services: {
                mobile_analytics: {
                    app_id: appId,
                    sdk_name: Platform.userAgent
                }
            }
        };
        return JSON.stringify(clientCtx);
    }

    /**
     * @private
     * check if current credentials exists
     */
    private _getCredentials() {
        const that = this;
        return Credentials.get()
            .then(credentials => {
                if (!credentials) return null;
                logger.debug('set credentials for analytics', credentials);
                return Credentials.shear(credentials);
            })
            .catch(err => {
                logger.debug('ensure credentials error', err);
                return null;
            });
    }
}
