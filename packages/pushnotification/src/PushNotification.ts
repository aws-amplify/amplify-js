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

import { NativeModules, DeviceEventEmitter, AsyncStorage, PushNotificationIOS, Platform, AppState } from 'react-native';
import Amplify, { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('Notification');

const RNPushNotification = NativeModules.RNPushNotification;
const REMOTE_NOTIFICATION_RECEIVED = 'remoteNotificationReceived';
const REMOTE_TOKEN_RECEIVED = 'remoteTokenReceived';
const REMOTE_NOTIFICATION_OPENED = 'remoteNotificationOpened';

export default class PushNotification {
    private _config;
    private handlers;
    private _currentState;
    private _androidInitialized;
    private _iosInitialized;
    private _deviceTokenKey;

    constructor(config) {
        if (config) {
            this.configure(config);
        } else {
            this._config = {};
        }
        this.handlers = [];
        this._updateEndpointWithDeviceToken = this._updateEndpointWithDeviceToken.bind(this);
        this._handleCampaignPush = this._handleCampaignPush.bind(this);
        this._handleCampaignOpened = this._handleCampaignOpened.bind(this);
        this._checkIfOpenedByCampaign = this._checkIfOpenedByCampaign.bind(this);
        this._currentState = AppState.currentState;
        this._androidInitialized = false;
        this._iosInitialized = false;

        if (Platform.OS === 'ios') {
            AppState.addEventListener('change', this._checkIfOpenedByCampaign, false);
        }
    }

    public getModuleName() {
        return "Pushnotification";
    }

    public configure(config) {
        let conf = config ? config.PushNotification || config : {};

        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
            };
        }

        this._config = Object.assign({}, this._config, conf);
        this._deviceTokenKey = `push_token${this._config.appId}`;

        if (Platform.OS === 'android' && !this._androidInitialized) {
            this._initializeAndroid();
            this._androidInitialized = true;
        }
        else if (Platform.OS === 'ios' && !this._iosInitialized) {
            this._initializeIOS();
            this._iosInitialized = true;
        }
    }

    public onNotification(handler) {
        if (typeof handler === 'function') {
            // check platform
            if (Platform.OS === 'ios') {
                this._addEventListenerForIOS(REMOTE_NOTIFICATION_RECEIVED, handler);
            } else {
                this._addEventListenerForAndroid(REMOTE_NOTIFICATION_RECEIVED, handler);
            }
        }
    }

    public onNotificationOpened(handler) {
        if (typeof handler === 'function') {
            // check platform
            if (Platform.OS === 'android') {
                this._addEventListenerForAndroid(REMOTE_NOTIFICATION_OPENED, handler);
            }
        }
    }

    public onRegister(handler) {
        if (typeof handler === 'function') {
            // check platform
            if (Platform.OS === 'ios') {
                this._addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, handler);
            } else {
                this._addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, handler);
            }
        }
    }

    private async _initializeAndroid() {
        this._addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, this._handleTokenReceived);
        this._addEventListenerForAndroid(REMOTE_NOTIFICATION_OPENED, this._handleCampaignOpened);
        this._addEventListenerForAndroid(REMOTE_NOTIFICATION_RECEIVED, this._handleCampaignPush);
        RNPushNotification.initialize();

        try {
            let token = await this._getCachedDeviceToken();
            if (!token) {
                logger.debug('Getting the token from Firebase Service');
                token = await RNPushNotification.getToken();
                await this._cacheDeviceToken(token);
            }
            await this._updateEndpointWithDeviceToken(token);
        } catch (e) {
            logger.error(e);
        }
    }

    private async _getCachedDeviceToken() {
        logger.debug('Getting the cached device token');
        return await AsyncStorage.getItem(this._deviceTokenKey);
    }

    private async _handleTokenReceived(token) {
        try {
            await this._cacheDeviceToken(token);
            await this._updateEndpointWithDeviceToken(token);
        } catch (e) {
            logger.error(e);
        }
    }

    private async _cacheDeviceToken(token) {
        if (!token) {
            logger.error('no device token recieved on register');
            return;
        }
        logger.debug('Caching the device token', token);
        await AsyncStorage.setItem(this._deviceTokenKey, token);
    }

    private async _initializeIOS() {
        PushNotificationIOS.requestPermissions({
            alert: true,
            badge: true,
            sound: true
        });
        this._addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, this._handleTokenReceived);
        this._addEventListenerForIOS(REMOTE_NOTIFICATION_RECEIVED, this._handleCampaignPush);
        try {
            const token = await this._getCachedDeviceToken();
            if (token) await this._updateEndpointWithDeviceToken(token);
        } catch (e) {
            logger.error(e);
        }
    }

    private _checkIfOpenedByCampaign(nextAppState) {
        // the app is turned from background to foreground	            
        if (this._currentState.match(/inactive|background/) && nextAppState === 'active') {
            PushNotificationIOS.getInitialNotification().then(data => {
                if (data) {
                    this._handleCampaignOpened(data);
                }
            }).catch(e => {
                logger.debug('Failed to get the initial notification.', e);
            });
        };
        this._currentState = nextAppState;
    }

    private _handleCampaignPush(rawMessage) {
        let message = rawMessage;
        let campaign = null;
        if (Platform.OS === 'ios') {
            message = this._parseMessageFromIOS(rawMessage);
            campaign = message && message.data && message.data.pinpoint ? message.data.pinpoint.campaign : null;
        } else if (Platform.OS === 'android') {
            const { data } = rawMessage;
            campaign = {
                campaign_id: data['pinpoint.campaign.campaign_id'],
                campaign_activity_id: data['pinpoint.campaign.campaign_activity_id'],
                treatment_id: data['pinpoint.campaign.treatment_id']
            }
        }

        if (!campaign) {
            logger.debug('no message received for campaign push');
            return;
        }

        const attributes = {
            campaign_activity_id: campaign['campaign_activity_id'],
            isAppInForeground: message.foreground ? 'true' : 'false',
            treatment_id: campaign['treatment_id'],
            campaign_id: campaign['campaign_id']
        };

        const eventType = (message.foreground) ? '_campaign.received_foreground' : '_campaign.received_background';

        if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
            Amplify.Analytics.record({
                name: eventType,
                attributes,
                immediate: true
            });
        } else {
            logger.debug('Analytics module is not registered into Amplify');
        }
    }

    private _handleCampaignOpened(rawMessage) {
        logger.debug('handleCampaignOpened, raw data', rawMessage);
        let campaign = null;
        if (Platform.OS === 'ios') {
            const message = this._parseMessageFromIOS(rawMessage);
            campaign = message && message.data && message.data.pinpoint ? message.data.pinpoint.campaign : null;
        } else if (Platform.OS === 'android') {
            const data = rawMessage;
            campaign = {
                campaign_id: data['pinpoint.campaign.campaign_id'],
                campaign_activity_id: data['pinpoint.campaign.campaign_activity_id'],
                treatment_id: data['pinpoint.campaign.treatment_id']
            }
        }

        if (!campaign) {
            logger.debug('no message received for campaign opened');
            return;
        }

        const attributes = {
            campaign_activity_id: campaign['campaign_activity_id'],
            treatment_id: campaign['treatment_id'],
            campaign_id: campaign['campaign_id']
        };

        const eventType = '_campaign.opened_notification';

        if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
            Amplify.Analytics.record({
                name: eventType,
                attributes,
                immediate: true
            });
        } else {
            logger.debug('Analytics module is not registered into Amplify');
        }
    }

    private async _updateEndpointWithDeviceToken(token) {
        logger.debug('Updating endpoint in push notification with device token', token);
        
        if (Amplify.Analytics && typeof Amplify.Analytics.updateEndpoint !== 'function') {
            throw (new Error('Analytics module is not registered into Amplify'));
        }

        const config = {
            Address: token,
            OptOut: 'NONE'
        };
        await Amplify.Analytics.updateEndpoint(config);
    }

    // only for android
    private _addEventListenerForAndroid(event, handler) {
        const that = this;
        const listener = DeviceEventEmitter.addListener(event, (data) => {
            // for on notification
            if (event === REMOTE_NOTIFICATION_RECEIVED) {
                handler(that._parseMessagefromAndroid(data));
                return;
            }
            if (event === REMOTE_TOKEN_RECEIVED) {
                const dataObj = data.dataJSON ? JSON.parse(data.dataJSON) : {};
                handler(dataObj.refreshToken);
                return;
            }
            if (event === REMOTE_NOTIFICATION_OPENED) {
                handler(that._parseMessagefromAndroid(data, 'opened'));
                return;
            }
        });
    }

    private _addEventListenerForIOS(event, handler) {
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

    private _parseMessagefromAndroid(message, from?) {
        let dataObj = null;
        try {
            dataObj = message.dataJSON ? JSON.parse(message.dataJSON) : null;
        } catch (e) {
            logger.debug('Failed to parse the data object', e);
            return;
        }

        if (!dataObj) {
            logger.debug('no notification payload received');
            return dataObj;
        }

        if (from === 'opened') {
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

    private _parseMessageFromIOS(message) {
        const _data = message && message._data ? message._data : null;
        const _alert = message && message._alert ? message._alert : {};

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
