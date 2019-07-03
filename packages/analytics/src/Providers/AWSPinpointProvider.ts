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
    Credentials,
    Signer,
    JS,
    Hub
} from '@aws-amplify/core';
import * as MobileAnalytics from 'aws-sdk/clients/mobileanalytics';
import * as Pinpoint from 'aws-sdk/clients/pinpoint';

import Cache from '@aws-amplify/cache';

import { AnalyticsProvider, PromiseHandlers } from '../types';
import { v1 as uuid } from 'uuid';

const AMPLIFY_SYMBOL = ((typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') ?
    Symbol.for('amplify_default') : '@@amplify_default') as Symbol;

const dispatchAnalyticsEvent = (event, data) => {
    Hub.dispatch('analytics', { event, data }, 'Analytics', AMPLIFY_SYMBOL);
};

const logger = new Logger('AWSPinpointProvider');
const RETRYABLE_CODES = [429, 500];
const ACCEPTED_CODES = [202];

// events buffer
const BUFFER_SIZE = 1000;
const FLUSH_SIZE = 100;
const FLUSH_INTERVAL = 5*1000; // 5s
const RESEND_LIMIT = 5;

// params: { event: {name: , .... }, timeStamp, config, resendLimit }
export default class AWSPinpointProvider implements AnalyticsProvider {
    static category = 'Analytics';
    static providerName = 'AWSPinpoint';

    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;
    private _sessionStartTimestamp;
    private _buffer;
    private _clientInfo;
    private _timer;
    private _endpointGenerating = true;

    constructor(config?) {
        this._buffer = [];
        this._config = config? config : {};
        this._config.bufferSize = this._config.bufferSize || BUFFER_SIZE;
        this._config.flushSize = this._config.flushSize || FLUSH_SIZE;
        this._config.flushInterval = this._config.flushInterval || FLUSH_INTERVAL;
        this._config.resendLimit = this._config.resendLimit || RESEND_LIMIT;
        this._clientInfo = ClientDevice.clientInfo();
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
                    const { params, handlers } = this._buffer.shift();
                    that._send(params, handlers);
                    // If this is the first request sent by Analytics module, we should stop sending remaining requests
                    // to prevent race condition of updating one endpoint when it's being created in the backend
                    if (this._endpointGenerating) break;
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
    private _putToBuffer(params, handlers) {
        const { bufferSize } = this._config;
        if (this._buffer.length < bufferSize) {
            this._buffer.push({params, handlers});
        } else {
            logger.debug('exceed analytics events buffer size');
            return handlers.reject(new Error('Exceed the size of analytics events buffer'));
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

        if (this._config['appId'] && !this._config['disabled']) {
            if (!this._config['endpointId']) {
                const cacheKey = this.getProviderName() + '_' + this._config['appId'];
                this._getEndpointId(cacheKey).then(endpointId => {
                    logger.debug('setting endpoint id from the cache', endpointId);
                    this._config['endpointId'] = endpointId;
                    dispatchAnalyticsEvent('pinpointProvider_configured', null);
                }).catch(e => {
                    logger.debug('Failed to generate endpointId', e);
                });
            } else {
                dispatchAnalyticsEvent('pinpointProvider_configured', null);
            }
            this._setupTimer();
        } else {
            if (this._timer) { clearInterval(this._timer); }
        }
        return this._config;
    }

    /**
     * record an event
     * @param {Object} params - the params of an event
     */
    public async record(params, handlers: PromiseHandlers) {
        const credentials = await this._getCredentials();
        if (!credentials || !this._config['appId'] || !this._config['region']){
            logger.debug('cannot send events without credentials, applicationId or region');
            return handlers.reject(new Error('No credentials, applicationId or region'));
        }
        const timestamp = new Date().getTime();
        // attach the session and eventId
        this._generateSession(params);
        params.event.eventId = uuid();

        Object.assign(params, { timestamp, config: this._config, credentials });
        if (params.event.immediate) {
            return this._send(params, handlers);
        } else {
            this._putToBuffer(params, handlers);
        }
    }

    private _generateSession(params) {
        this._sessionId = this._sessionId || uuid();
        const { event } = params;

        switch (event.name) {
            case '_session.start':
                // refresh the session id and session start time
                this._sessionStartTimestamp = new Date().getTime();
                this._sessionId = uuid();
                event.session = {
                    Id: this._sessionId,
                    StartTimestamp: new Date(this._sessionStartTimestamp).toISOString()
                };
                break;
            case '_session.stop':
                const stopTimestamp = new Date().getTime();
                this._sessionStartTimestamp = this._sessionStartTimestamp || new Date().getTime();
                this._sessionId = this._sessionId || uuid();
                event.session = {
                    Id: this._sessionId,
                    Duration: stopTimestamp - this._sessionStartTimestamp,
                    StartTimestamp: new Date(this._sessionStartTimestamp).toISOString(),
                    StopTimestamp: new Date(stopTimestamp).toISOString()
                };
                this._sessionId = undefined;
                this._sessionStartTimestamp = undefined;
                break;
            default:
                this._sessionStartTimestamp = this._sessionStartTimestamp || new Date().getTime();
                this._sessionId = this._sessionId || uuid();
                event.session = {
                    Id: this._sessionId,
                    StartTimestamp: new Date(this._sessionStartTimestamp).toISOString()
                };
                break;
        }
    }

    private async _send(params, handlers) {
        const { event, config } = params;

        switch (event.name) {
            case '_update_endpoint':
                return this._updateEndpoint(params, handlers);
            default:
                return this._record(params, handlers);
        }
    }

    private _generateBatchItemContext(params) {
        const { event, timestamp, config, credentials } = params;
        const { name, attributes, metrics, eventId, session } = event;
        const { appId, endpointId } = config;

        const endpointContext = {};

        const eventParams = {
            ApplicationId: appId,
            EventsRequest: {
                BatchItem: {}
            }
        };

        eventParams.EventsRequest.BatchItem[endpointId] = {};
        const endpointObj = eventParams.EventsRequest.BatchItem[endpointId];
        endpointObj['Endpoint'] = endpointContext;
        endpointObj['Events'] = {};
        endpointObj['Events'][eventId] = {
            EventType: name,
            Timestamp: new Date(timestamp).toISOString(),
            Attributes: attributes,
            Metrics: metrics,
            Session: session
        };

        return eventParams;
    }

    private async _pinpointPutEvents(params, handlers) {
        const { event : { eventId }, config : { endpointId } } = params;
        const eventParams = this._generateBatchItemContext(params);
        logger.debug('pinpoint put events with params', eventParams);

        const request = this.pinpointClient.putEvents(eventParams);
        // in order to keep backward compatiblity
        // we are using a legacy api: /apps/{appid}/events/legacy
        // so that users don't need to update their IAM Policy
        // will use the formal one in the next break release
        request.on('build', function() {
            request.httpRequest.path = request.httpRequest.path + '/legacy';
        });

        request.send((err, data) => {
            if (err) {
                logger.error('record event failed. ', err);
                logger.warn(
                    'If you have not updated your Pinpoint IAM Policy' + 
                    ' with the Action: \"mobiletargeting:PutEvents\" yet, please do it.' + 
                    ' This action is not necessary for now' + 
                    ' but in order to avoid breaking changes in the future,' + 
                    ' please update it as soon as possible.'
                );
                return handlers.reject(err);
            }
            else {
                const { 
                    EventsResponse : { 
                        Results : { 
                            [endpointId] : { 
                                EventsItemResponse: {
                                    [eventId]: {
                                        StatusCode,
                                        Message
                                    }
                                }
                            } 
                        } 
                    } 
                } = data;
                if ( ACCEPTED_CODES.includes(StatusCode)) {
                    this._endpointGenerating = false;
                    logger.debug('record event success. ', data);
                    return handlers.resolve(data);
                } else {
                    if (RETRYABLE_CODES.includes(StatusCode)) {
                        this._retry(params, handlers);
                    } else {
                        logger.error(`Event ${eventId} is not accepted, the error is ${Message}`);
                        return handlers.reject(data);
                    }
                }
            }
        });
    }

    private _retry(params, handlers) {
        const { config : { resendLimit } } = params;
        // For backward compatibility
        params.resendLimit = typeof params.resendLimit === 'number' ?
            params.resendLimit : resendLimit;
        if (params.resendLimit-- > 0) {
            logger.debug(
                `resending event ${params.eventName} with ${params.resendLimit} retry times left`);
            this._putToBuffer(params, handlers);
        } else {
            logger.debug(`retry times used up for event ${params.eventName}`);
        }
    }

    private async _record(params, handlers) {
        // credentials updated
        const { event, timestamp, config, credentials } = params;
        this._initClients(config, credentials);
        return this._pinpointPutEvents(params, handlers);
    }

    private async _updateEndpoint(params, handlers) {
        // credentials updated
        const { timestamp, config, credentials, event } = params;
        const { appId, region, endpointId } = config;

        this._initClients(config, credentials);

        const request = this._endpointRequest(
            config,
            JS.transferKeyToLowerCase(event, [], ['attributes', 'userAttributes', 'Attributes', 'UserAttributes'])
        );
        const update_params = {
            ApplicationId: appId,
            EndpointId: endpointId,
            EndpointRequest: request
        };

        const that = this;
        logger.debug('updateEndpoint with params: ', update_params);

        that.pinpointClient.updateEndpoint(update_params, (err, data) => {
            if (err) {
                logger.debug('updateEndpoint failed', err);
                if (err.message.startsWith('Exceeded maximum endpoint per user count')) {
                    this._removeUnusedEndpoints(appId, request.User.UserId)
                    .then(() => {
                        logger.debug('Remove the unused endpoints successfully');
                        this._retry(params, handlers);
                    }).catch(e => {
                        logger.warn(`Failed to remove unused endpoints with error: ${e}`);
                        logger.warn(`Please ensure you have updated your Pinpoint IAM Policy ` +
                            `with the Action: "mobiletargeting:GetUserEndpoints" ` +
                            `in order to get endpoints info of the user`);
                        return handlers.reject(err);
                    });
                }
                else return handlers.reject(err);
            } else {
                logger.debug('updateEndpoint success', data);
                this._endpointGenerating = false;
                return handlers.resolve(data);
            }
        });
    }

    private async _removeUnusedEndpoints(appId, userId) {
        return new Promise((res, rej) => {
            this.pinpointClient.getUserEndpoints(
                {
                    ApplicationId: appId,
                    UserId: userId
                },
                (err, data) => {
                    if (err) {
                        logger.debug(`Failed to get endpoints associated with the userId: ${userId} with error`, err);
                        return rej(err);
                    }
                    const endpoints = data.EndpointsResponse.Item;
                    logger.debug(`get endpoints associated with the userId: ${userId} with data`, endpoints);
                    let endpointToBeDeleted = endpoints[0];
                    for (let i = 1; i < endpoints.length; i++) {
                        const timeStamp1 = Date.parse(endpointToBeDeleted['EffectiveDate']);
                        const timeStamp2 = Date.parse(endpoints[i]['EffectiveDate']);
                        // delete the one with invalid effective date
                        if (isNaN(timeStamp1)) break;
                        if (isNaN(timeStamp2)) { endpointToBeDeleted = endpoints[i]; break; }

                        if (timeStamp2 < timeStamp1) {
                            endpointToBeDeleted = endpoints[i];
                        }
                    }
                    // update the endpoint's user id with an empty string
                    const update_params = {
                        ApplicationId: appId,
                        EndpointId: endpointToBeDeleted['Id'],
                        EndpointRequest: {
                            User: {
                                UserId: ''
                            }
                        }
                    };
                    this.pinpointClient.updateEndpoint(
                        update_params,
                        (err, data) => {
                            if (err) {
                                logger.debug('Failed to update the endpoint', err);
                                return rej(err);
                            }
                            logger.debug('The old endpoint is updated with an empty string for user id');
                            return res(data);
                        });
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
        if (Platform.isReactNative) {
            this.pinpointClient.customizeRequests(function(request) {
                request.on('build', function(req) {
                    req.httpRequest.headers['user-agent'] = Platform.userAgent;
                });
            });
        }

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
        const clientInfo = this._clientInfo || {};
        const clientContext = config.clientContext || {};
        // for now we have three different ways for default endpoint configurations
        // clientInfo
        // clientContext (deprecated)
        // config.endpoint
        const defaultEndpointConfig = config.endpoint || {};
        const demographicByClientInfo = {
            appVersion: clientInfo.appVersion,
            make: clientInfo.make,
            model: clientInfo.model,
            modelVersion: clientInfo.version,
            platform: clientInfo.platform
        };
        // for backward compatibility
        const {
            clientId,
            appTitle,
            appVersionName,
            appVersionCode,
            appPackageName,
            ...demographicByClientContext
        } = clientContext;
        const channelType = event.address? ((clientInfo.platform === 'android') ? 'GCM' : 'APNS') : undefined;
        const tmp = {
            channelType,
            requestId: uuid(),
            effectiveDate:new Date().toISOString(),
            ...defaultEndpointConfig,
            ...event,
            attributes: {
                ...defaultEndpointConfig.attributes,
                ...event.attributes
            },
            demographic: {
                ...demographicByClientInfo,
                ...demographicByClientContext,
                ...defaultEndpointConfig.demographic,
                ...event.demographic
            },
            location: {
                ...defaultEndpointConfig.location,
                ...event.location
            },
            metrics: {
                ...defaultEndpointConfig.metrics,
                ...event.metrics
            },
            user: {
                userId: event.userId || defaultEndpointConfig.userId || credentials.identityId,
                userAttributes: {
                    ...defaultEndpointConfig.userAttributes,
                    ...event.userAttributes
                }
            }
        };

        // eliminate unnecessary params
        const { userId, userAttributes, name, session, eventId, immediate, ...ret } = tmp;
        return JS.transferKeyToUpperCase(ret, [], ['metrics', 'userAttributes', 'attributes']);
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
