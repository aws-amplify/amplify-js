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
	NativeModules,
	DeviceEventEmitter,
	AsyncStorage,
	PushNotificationIOS,
	Platform,
	AppState,
} from 'react-native';
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';

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

	constructor(config) {
		if (config) {
			this.configure(config);
		} else {
			this._config = {};
		}
		this.handlers = [];
		this.updateEndpoint = this.updateEndpoint.bind(this);
		this.handleCampaignPush = this.handleCampaignPush.bind(this);
		this.handleCampaignOpened = this.handleCampaignOpened.bind(this);
		this._checkIfOpenedByCampaign = this._checkIfOpenedByCampaign.bind(this);
		this._currentState = AppState.currentState;
		this._androidInitialized = false;
		this._iosInitialized = false;

		if (Platform.OS === 'ios') {
			AppState.addEventListener('change', this._checkIfOpenedByCampaign, false);
		}
		Amplify.register(this);
	}

	getModuleName() {
		return 'Pushnotification';
	}

	configure(config) {
		let conf = config ? config.PushNotification || config : {};

		if (conf['aws_mobile_analytics_app_id']) {
			conf = {
				appId: conf['aws_mobile_analytics_app_id'],
			};
		}

		this._config = Object.assign(
			{
				// defaults
				requestIOSPermissions: true, // for backwards compatibility
			},
			this._config,
			conf
		);

		if (Platform.OS === 'android' && !this._androidInitialized) {
			this.initializeAndroid();
			this._androidInitialized = true;
		} else if (Platform.OS === 'ios' && !this._iosInitialized) {
			this.initializeIOS();
			this._iosInitialized = true;
		}
	}

	onNotification(handler) {
		if (typeof handler === 'function') {
			// check platform
			if (Platform.OS === 'ios') {
				this.addEventListenerForIOS(REMOTE_NOTIFICATION_RECEIVED, handler);
			} else {
				this.addEventListenerForAndroid(REMOTE_NOTIFICATION_RECEIVED, handler);
			}
		}
	}

	onNotificationOpened(handler) {
		if (typeof handler === 'function') {
			// check platform
			if (Platform.OS === 'android') {
				this.addEventListenerForAndroid(REMOTE_NOTIFICATION_OPENED, handler);
			}
		}
	}

	onRegister(handler) {
		if (typeof handler === 'function') {
			// check platform
			if (Platform.OS === 'ios') {
				this.addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, handler);
			} else {
				this.addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, handler);
			}
		}
	}

	async initializeAndroid() {
		this.addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
		this.addEventListenerForAndroid(
			REMOTE_NOTIFICATION_OPENED,
			this.handleCampaignOpened
		);
		this.addEventListenerForAndroid(
			REMOTE_NOTIFICATION_RECEIVED,
			this.handleCampaignPush
		);
		RNPushNotification.initialize();

		// check if the token is cached properly
		if (!(await this._registerTokenCached())) {
			const { appId } = this._config;
			const cacheKey = 'push_token' + appId;
			RNPushNotification.getToken(token => {
				logger.debug('Get the token from Firebase Service', token);
				// resend the token in case it's missing in the Pinpoint service
				// the token will also be cached locally
				this.updateEndpoint(token);
			});
		}
	}

	async _registerTokenCached(): Promise<boolean> {
		const { appId } = this._config;
		const cacheKey = 'push_token' + appId;
		return AsyncStorage.getItem(cacheKey).then(lastToken => {
			if (lastToken) return true;
			else return false;
		});
	}

	requestIOSPermissions(options = { alert: true, badge: true, sound: true }) {
		PushNotificationIOS.requestPermissions(options);
	}

	initializeIOS() {
		if (this._config.requestIOSPermissions) {
			this.requestIOSPermissions();
		}
		this.addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
		this.addEventListenerForIOS(
			REMOTE_NOTIFICATION_RECEIVED,
			this.handleCampaignPush
		);
	}

	_checkIfOpenedByCampaign(nextAppState) {
		// the app is turned from background to foreground
		if (
			this._currentState.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			PushNotificationIOS.getInitialNotification()
				.then(data => {
					if (data) {
						this.handleCampaignOpened(data);
					}
				})
				.catch(e => {
					logger.debug('Failed to get the initial notification.', e);
				});
		}
		this._currentState = nextAppState;
	}

	handleCampaignPush(rawMessage) {
		let message = rawMessage;
		let campaign = null;
		if (Platform.OS === 'ios') {
			message = this.parseMessageFromIOS(rawMessage);
			campaign =
				message && message.data && message.data.pinpoint
					? message.data.pinpoint.campaign
					: null;
		} else if (Platform.OS === 'android') {
			const { data } = rawMessage;
			campaign = {
				campaign_id: data['pinpoint.campaign.campaign_id'],
				campaign_activity_id: data['pinpoint.campaign.campaign_activity_id'],
				treatment_id: data['pinpoint.campaign.treatment_id'],
			};
		}

		if (!campaign) {
			logger.debug('no message received for campaign push');
			return;
		}

		const attributes = {
			campaign_activity_id: campaign['campaign_activity_id'],
			isAppInForeground: message.foreground ? 'true' : 'false',
			treatment_id: campaign['treatment_id'],
			campaign_id: campaign['campaign_id'],
		};

		const eventType = message.foreground
			? '_campaign.received_foreground'
			: '_campaign.received_background';

		if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
			Amplify.Analytics.record({
				name: eventType,
				attributes,
				immediate: true,
			});
		} else {
			logger.debug('Analytics module is not registered into Amplify');
		}
	}

	handleCampaignOpened(rawMessage) {
		logger.debug('handleCampaignOpened, raw data', rawMessage);
		let campaign = null;
		if (Platform.OS === 'ios') {
			const message = this.parseMessageFromIOS(rawMessage);
			campaign =
				message && message.data && message.data.pinpoint
					? message.data.pinpoint.campaign
					: null;
		} else if (Platform.OS === 'android') {
			const data = rawMessage;
			campaign = {
				campaign_id: data['pinpoint.campaign.campaign_id'],
				campaign_activity_id: data['pinpoint.campaign.campaign_activity_id'],
				treatment_id: data['pinpoint.campaign.treatment_id'],
			};
		}

		if (!campaign) {
			logger.debug('no message received for campaign opened');
			return;
		}

		const attributes = {
			campaign_activity_id: campaign['campaign_activity_id'],
			treatment_id: campaign['treatment_id'],
			campaign_id: campaign['campaign_id'],
		};

		const eventType = '_campaign.opened_notification';

		if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
			Amplify.Analytics.record({
				name: eventType,
				attributes,
				immediate: true,
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
		AsyncStorage.getItem(cacheKey)
			.then(lastToken => {
				if (!lastToken || lastToken !== token) {
					logger.debug('refresh the device token with', token);
					const config = {
						Address: token,
						OptOut: 'NONE',
					};
					if (
						Amplify.Analytics &&
						typeof Amplify.Analytics.updateEndpoint === 'function'
					) {
						Amplify.Analytics.updateEndpoint(config)
							.then(data => {
								logger.debug(
									'update endpoint success, setting token into cache'
								);
								AsyncStorage.setItem(cacheKey, token);
							})
							.catch(e => {
								// ........
								logger.debug('update endpoint failed', e);
							});
					} else {
						logger.debug('Analytics module is not registered into Amplify');
					}
				}
			})
			.catch(e => {
				logger.debug('set device token in cache failed', e);
			});
	}

	// only for android
	addEventListenerForAndroid(event, handler) {
		const that = this;
		const listener = DeviceEventEmitter.addListener(event, data => {
			// for on notification
			if (event === REMOTE_NOTIFICATION_RECEIVED) {
				handler(that.parseMessagefromAndroid(data));
				return;
			}
			if (event === REMOTE_TOKEN_RECEIVED) {
				const dataObj = data.dataJSON ? JSON.parse(data.dataJSON) : {};
				handler(dataObj.refreshToken);
				return;
			}
			if (event === REMOTE_NOTIFICATION_OPENED) {
				handler(that.parseMessagefromAndroid(data, 'opened'));
				return;
			}
		});
	}

	addEventListenerForIOS(event, handler) {
		const that = this;
		if (event === REMOTE_TOKEN_RECEIVED) {
			PushNotificationIOS.addEventListener('register', data => {
				handler(data);
			});
		}
		if (event === REMOTE_NOTIFICATION_RECEIVED) {
			PushNotificationIOS.addEventListener('notification', handler);
		}
	}

	parseMessagefromAndroid(message, from?) {
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
		const dataPayload = dataObj.data || {};
		if (dataPayload['pinpoint.campaign.campaign_id']) {
			ret = {
				title: dataPayload['pinpoint.notification.title'],
				body: dataPayload['pinpoint.notification.body'],
				data: dataPayload,
				foreground: dataObj.foreground,
			};
		}
		return ret;
	}

	parseMessageFromIOS(message) {
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
			data,
		};
		return ret;
	}
}
