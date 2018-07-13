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

import { NativeModules, DeviceEventEmitter, AsyncStorage, PushNotificationIOS, Platform } from 'react-native';
import Amplify, { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('Notification');

const RNPushNotification = NativeModules.RNPushNotification;
const REMOTE_NOTIFICATION_RECEIVED = 'remoteNotificationReceived';
const REMOTE_TOKEN_RECEIVED = 'remoteTokenReceived';

export default class PushNotification {
    private _config;
    private handlers;

    constructor(config) {
        if (config) {
            this.configure(config);
        } else {
            this._config = {};
        }
        this.handlers = [];
        this.updateEndpoint = this.updateEndpoint.bind(this);
        this.handleCampaignPush = this.handleCampaignPush.bind(this);
    }

    getModuleName() {
        return "Pushnotification";
    }

    configure(config) {
        let conf = config ? config.PushNotification || config : {};

        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
            };
        }

        this._config = Object.assign({}, this._config, conf);

        if (Platform.OS === 'android') this.initializeAndroid();
        else if (Platform.OS === 'ios') this.initializeIOS();
    }

    onNotification(handler) {
        if (typeof handler === 'function') {
            // check platform
            if ( Platform.OS === 'ios' ) {
                this.addEventListenerForIOS(REMOTE_NOTIFICATION_RECEIVED, handler);
            } else {
                this.addEventListenerForAndroid(REMOTE_NOTIFICATION_RECEIVED, handler);   
            }
        }
    }

    onRegister(handler) {
        if (typeof handler === 'function') {
            // check platform
            if ( Platform.OS === 'ios' ) {
                this.addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, handler);
            } else {
                this.addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, handler);   
            }
        }
    }

    initializeAndroid() {
        this.addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
        this.addEventListenerForAndroid(REMOTE_NOTIFICATION_RECEIVED, this.handleCampaignPush);
        RNPushNotification.initialize();
    }

    initializeIOS() {
        PushNotificationIOS.requestPermissions({
            alert: true,
            badge: true,
            sound: true
        });
        this.addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
        this.addEventListenerForIOS(REMOTE_NOTIFICATION_RECEIVED, this.handleCampaignPush);
    }

    handleCampaignPush(rawMessage) {
        let message = rawMessage;
        if (Platform.OS === 'ios') {
            message = this.parseMessageFromIOS(rawMessage);
        }
        const campaign = message && message.data && message.data.pinpoint ? message.data.pinpoint.campaign: null;

        if (!campaign) {
            logger.debug('no message received for campaign push');
            return;
        }

        const attributes = {
            campaign_activity_id: campaign['campaign_activity_id'],
            isAppInForeground: message.foreground? 'true' : 'false',
            treatment_id: campaign['treatment_id'],
            campaign_id: campaign['campaign_id']
        };

        const eventType = (message.foreground)?'_campaign.received_foreground':'_campaign.received_background';

        if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
            Amplify.Analytics.record({
                name: eventType, 
                attributes
            });
        } else {
            logger.debug('Analytics module is not registered into Amplify');
        }
    }

    updateEndpoint(token) {
        if (!token) {
            logger.debug('no device token recieved on register');
            return;
        }

        const { appId } = this._config;
        const cacheKey = 'push_token' + appId;
        logger.debug('update endpoint in push notification', token);
        AsyncStorage.getItem(cacheKey).then((lastToken) => {
            if (!lastToken || lastToken !== token) {
                logger.debug('refresh the device token with', token);
                const config = {
                    Address: token,
                    OptOut: 'NONE'
                };
                if (Amplify.Analytics && typeof Amplify.Analytics.updateEndpoint === 'function') {
                    Amplify.Analytics.updateEndpoint(config).then((data) => {
                        logger.debug('update endpoint success, setting token into cache');
                        AsyncStorage.setItem(cacheKey, token);
                    }).catch(e => {
                        // ........
                        logger.debug('update endpoint failed', e);
                    });
                } else {
                    logger.debug('Analytics module is not registered into Amplify');
                }
            }
        }).catch(e => {
            logger.debug('set device token in cache failed', e);
        });
    }

    // only for android
    addEventListenerForAndroid(event, handler) {
        const that = this;
        const listener = DeviceEventEmitter.addListener(event, (data) => {
            // for on notification
            if (event === REMOTE_NOTIFICATION_RECEIVED) {
                handler(that.parseMessagefromAndroid(data));
                return;
            }
            if (event === REMOTE_TOKEN_RECEIVED) {
                const dataObj = data.dataJSON? JSON.parse(data.dataJSON) : {};
                handler(dataObj.refreshToken);
                return;
            }
        });
    }

    addEventListenerForIOS(event, handler) {
        const that = this;
        if (event === REMOTE_TOKEN_RECEIVED) {
            PushNotificationIOS.addEventListener('register', (data) => {
                handler(data);
            });
        }
        if (event === REMOTE_NOTIFICATION_RECEIVED) {
            PushNotificationIOS.addEventListener('notification', handler);
        }
    }

    parseMessagefromAndroid(message) {
        const dataObj = message.dataJSON? JSON.parse(message.dataJSON) : null;
        if (!dataObj) {
            logger.debug('no notification payload received');
            return dataObj;
        }

        let ret = null;
        const dataPayload = dataObj.data;
        if (dataPayload['pinpoint.campaign.campaign_id']) {
            ret = {
                title: dataPayload['pinpoint.notification.title'],
                body: dataPayload['pinpoint.notification.body'],
                data: dataPayload,
                foreground: dataObj.foreground
            };
        }
        return ret;
    }

    parseMessageFromIOS(message) {
        const _data = message && message._data? message._data : null;
        const _alert = message && message._alert? message._alert: {};

        if (!_data && !_alert) {
            logger.debug('no notification payload received');
            return {};
        }
        const data = _data.data;
        const title = _alert.title;
        const body = _alert.body;
        let ret = null;
        ret = {
            title,
            body,
            data
        };
        return ret;
    }
}
