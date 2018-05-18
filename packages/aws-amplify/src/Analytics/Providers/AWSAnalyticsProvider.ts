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
import { ConsoleLogger as Logger, Pinpoint, MobileAnalytics} from '../../Common';
import Platform from '../../Common/Platform';
import Cache from '../../Cache';
import { AnalyticsProvider } from '../types';
import { v1 as uuid } from 'uuid';

const logger = new Logger('AWSAnalyticsProvider');
const NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];

export default class AWSAnalyticsProvider implements AnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;

    constructor(config?) {
        this._config = config? config : {};
    }

    /**
     * get the category of the plugin
     */
    public getCategory(): string {
        return 'Analytics';
    }

    /**
     * get provider name of the plugin
     */
    public getProviderName(): string {
        return 'AWSAnalytics';
    }

    /**
     * configure the plugin
     * @param {Object} config - configuration
     */
    public configure(config): object {
        logger.debug('configure Analytics', config);
        const conf = config? config : {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    }

    /**
     * record an event
     * @param {Object} params - the params of an event
     */
    public record(params): Promise<boolean> {
        const { eventName } = params;
        switch (eventName) {
            case '_session_start':
                return this._startSession(params);
            case '_session_stop':
                return this._stopSession(params);
            case '_update_endpoint':
                return this._updateEndpoint(params);
            default:
                return this._recordCustomEvent(params);
        }
    }

    /**
     * @private
     * @param params 
     */
    private async _startSession(params) {
        // credentials updated
        const { timestamp, config } = params;

        const initClients = await this._init(config);
        if (!initClients) return false;
        

        logger.debug('record session start');
        this._sessionId = uuid();
        const sessionId = this._sessionId;
        
        const clientContext = this._generateClientContext();
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
        const { timestamp, config } = params;

        const initClients = await this._init(config);
        if (!initClients) return false;

        logger.debug('record session stop');
    
        const sessionId = this._sessionId ? this._sessionId : uuid();
        const clientContext = this._generateClientContext();
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
        const { timestamp, config } = params;

        const initClients = await this._init(config);
        if (!initClients) return false;

        this._config = Object.assign(this._config, config);

        const { appId, region, credentials, endpointId } = this._config;
        const cacheKey = this.getProviderName() + '_' + appId;
        // const endpointId = endpointId? endpointId : await this._getEndpointId(cacheKey);

        const request = this._endpointRequest();
        const update_params = {
            ApplicationId: appId,
            EndpointId: endpointId || await this._getEndpointId(cacheKey),
            EndpointRequest: request
        };

        const that = this;
        logger.debug('updateEndpoint with params: ', update_params);
        return new Promise<boolean>((res, rej) => {
            that.pinpointClient.updateEndpoint(update_params, (err, data) => {
                if (err) {
                    logger.debug('Pinpoint ERROR', err);
                    res(false);
                } else {
                    logger.debug('Pinpoint SUCCESS', data);
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
        const { eventName, attributes, metrics, timestamp, config } = params;

        const initClients = await this._init(config);
        if (!initClients) return false;
        
        const clientContext = this._generateClientContext();
        const eventParams = {
            clientContext,
            events: [
                {
                    eventType: eventName,
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
    private async _init(config) {
        logger.debug('init clients');
        if (!config.credentials) {
            logger.debug('no credentials provided by config, abort this init');
            return false;
        }
        if (this.mobileAnalytics 
            && this._config.credentials 
            && this._config.credentials.sessionToken === config.credentials.sessionToken
            && this._config.credentials.identityId === config.credentials.identityId) {
            logger.debug('no change for analytics config, directly return from init');
            return true;
        }

        const { appId } = config;
        const cacheKey = this.getProviderName() + '_' + appId;
        const endpointId = config.endpointId ? config.endpointId :
            (this._config.endpointId ? this._config.endpointId : await this._getEndpointId(cacheKey));

        this._config = Object.assign(this._config, { endpointId }, config);
        this._initMobileAnalytics();
        return new Promise((res, rej) => {
            this._initPinpoint().then((data) => {
                res(true);
            }).catch((err) => {
                res(false);
            });
        });
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
     * @private
     * Init the MobileAnalytics client
     */
    private _initMobileAnalytics() {
        const { credentials, region } = this._config;
        this.mobileAnalytics = new MobileAnalytics({ credentials, region });
    }

    /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
     */
    private _initPinpoint() {
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
        logger.debug('updateEndpoint with params: ', update_params);

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
        const { 
            clientInfo, 
            credentials, 
            Address, 
            RequestId, 
            Attributes,
            UserAttributes,
            endpointId, 
            UserId
        } = this._config;

        const user_id = (credentials && credentials.authenticated) ? credentials.identityId : null;
        const ChannelType = Address? ((clientInfo.platform === 'android') ? 'GCM' : 'APNS') : undefined;

        logger.debug('demographic user id: ', user_id);
        const OptOut = this._config.OptOut? this._config.OptOut: undefined;
        const ret = {
            Address,
            Attributes,
            ChannelType,
            Demographic: {
                AppVersion: this._config.appVersion || clientInfo.appVersion,
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
    private _generateClientContext() {
        const { endpointId, appId, clientInfo } = this._config;
        const clientContext = this._config.clientContext || {};

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
}
