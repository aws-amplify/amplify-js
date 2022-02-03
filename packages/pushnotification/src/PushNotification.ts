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
	Platform,
	AppState,
} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Amplify, ConsoleLogger as Logger, JS } from '@aws-amplify/core';

const logger = new Logger('Notification');

const RNPushNotification = NativeModules.RNPushNotification;
const REMOTE_NOTIFICATION_RECEIVED = 'remoteNotificationReceived';
const REMOTE_TOKEN_RECEIVED = 'remoteTokenReceived';
const REMOTE_NOTIFICATION_OPENED = 'remoteNotificationOpened';

export default class PushNotification {
	private _config;
	private _currentState;
	private _androidInitialized: boolean;
	private _iosInitialized: boolean;

	private _notificationOpenedHandlers: Function[];

	constructor(config) {
		if (config) {
			this.configure(config);
		} else {
			this._config = {};
		}
		this.updateEndpoint = this.updateEndpoint.bind(this);
		this.handleNotificationReceived = this.handleNotificationReceived.bind(
			this
		);
		this.handleNotificationOpened = this.handleNotificationOpened.bind(this);
		this._checkIfOpenedByNotification = this._checkIfOpenedByNotification.bind(
			this
		);
		this.addEventListenerForIOS = this.addEventListenerForIOS.bind(this);
		this._currentState = AppState.currentState;
		this._androidInitialized = false;
		this._iosInitialized = false;

		this._notificationOpenedHandlers = [];
	}

	getModuleName() {
		return 'Pushnotification';
	}

	configure(config) {
		if (JS.isEmpty(config)) return this._config;
		let conf = config ? config.PushNotification || config : {};

		if (config['aws_mobile_analytics_app_id']) {
			conf = {
				appId: config['aws_mobile_analytics_app_id'],
				...conf,
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
		return this._config;
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
			this._notificationOpenedHandlers = [
				...this._notificationOpenedHandlers,
				handler,
			];
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
			this.handleNotificationOpened
		);
		this.addEventListenerForAndroid(
			REMOTE_NOTIFICATION_RECEIVED,
			this.handleNotificationReceived
		);
		RNPushNotification.initialize();

		// check if the token is cached properly
		if (!(await this._registerTokenCached())) {
			const { appId } = this._config;
			const cacheKey = 'push_token' + appId;
			RNPushNotification.getToken(
				token => {
					logger.debug('Get the token from Firebase Service', token);
					// resend the token in case it's missing in the Pinpoint service
					// the token will also be cached locally
					this.updateEndpoint(token);
				},
				error => {
					logger.error('Error getting the token from Firebase Service', error);
				}
			);
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
			this.handleNotificationReceived
		);
		this.addEventListenerForIOS(
			REMOTE_NOTIFICATION_OPENED,
			this.handleNotificationOpened
		);
	}

	/**
	 * This function handles the React Native AppState change event
	 * And checks if the app was launched by a Push Notification
	 * Note: Current AppState will be null or 'unknown' if the app is coming from killed state to active
	 * @param nextAppState The next state the app is changing to as part of the event
	 */
	_checkIfOpenedByNotification(nextAppState, handler) {
		// the App state changes from killed state to active
		if (
			(!this._currentState || this._currentState === 'unknown') &&
			nextAppState === 'active'
		) {
			// If the app was launched with a notification (launched means from killed state)
			// getInitialNotification() returns the notification object data every time its called
			// Thus calling it when moving from background to foreground subsequently will lead to extra
			// events being logged with the payload of the initial notification that launched the app
			PushNotificationIOS.getInitialNotification()
				.then(data => {
					if (data) {
						handler(data);
					}
				})
				.catch(e => {
					logger.debug('Failed to get the initial notification.', e);
				});
		}
		this._currentState = nextAppState;
	}

	parseMessageData = rawMessage => {
		let eventSource = null;
		let eventSourceAttributes = {};

		if (Platform.OS === 'ios') {
			const message = this.parseMessageFromIOS(rawMessage);
			const pinpointData =
				message && message.data ? message.data.pinpoint : null;
			if (pinpointData && pinpointData.campaign) {
				eventSource = 'campaign';
				eventSourceAttributes = pinpointData.campaign;
			} else if (pinpointData && pinpointData.journey) {
				eventSource = 'journey';
				eventSourceAttributes = pinpointData.journey;
			}
		} else if (Platform.OS === 'android') {
			const { data } = rawMessage;
			const pinpointData =
				data && data.pinpoint ? JSON.parse(data.pinpoint) : null;
			if (pinpointData && pinpointData.journey) {
				eventSource = 'journey';
				eventSourceAttributes = pinpointData.journey;
			}
			// Check if it is a campaign in Android by looking for the Campaign ID key
			// Android campaign payload is flat and differs from Journey and iOS payloads
			// TODO: The service should provide data in a consistent format similar to iOS
			else if (data && data['pinpoint.campaign.campaign_id']) {
				eventSource = 'campaign';
				eventSourceAttributes = {
					campaign_id: data['pinpoint.campaign.campaign_id'],
					campaign_activity_id: data['pinpoint.campaign.campaign_activity_id'],
					treatment_id: data['pinpoint.campaign.treatment_id'],
				};
			}
		}

		return {
			eventSource,
			eventSourceAttributes,
		};
	};

	handleNotificationReceived(rawMessage) {
		logger.debug('handleNotificationReceived, raw data', rawMessage);
		const { eventSource, eventSourceAttributes } = this.parseMessageData(
			rawMessage
		);

		if (!eventSource) {
			logger.debug('message received is not from a pinpoint eventSource');
			return;
		}

		const isAppInForeground =
			Platform.OS === 'ios'
				? this._currentState === 'active'
				: rawMessage.foreground;

		const attributes = {
			...eventSourceAttributes,
			isAppInForeground,
		};

		const eventType = isAppInForeground
			? `_${eventSource}.received_foreground`
			: `_${eventSource}.received_background`;

		if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
			Amplify.Analytics.record({
				name: eventType,
				attributes,
				immediate: false,
			});
		} else {
			logger.debug('Analytics module is not registered into Amplify');
		}
	}

	handleNotificationOpened(rawMessage) {
		this._notificationOpenedHandlers.forEach(handler => {
			handler(rawMessage);
		});

		logger.debug('handleNotificationOpened, raw data', rawMessage);
		const { eventSource, eventSourceAttributes } = this.parseMessageData(
			rawMessage
		);

		if (!eventSource) {
			logger.debug('message received is not from a pinpoint eventSource');
			return;
		}

		const attributes = {
			...eventSourceAttributes,
		};

		const eventType = `_${eventSource}.opened_notification`;

		if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
			Amplify.Analytics.record({
				name: eventType,
				attributes,
				immediate: false,
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
		if (event === REMOTE_TOKEN_RECEIVED) {
			PushNotificationIOS.addEventListener('register', data => {
				handler(data);
			});
		}
		if (event === REMOTE_NOTIFICATION_RECEIVED) {
			PushNotificationIOS.addEventListener('notification', handler);
		}
		if (event === REMOTE_NOTIFICATION_OPENED) {
			PushNotificationIOS.addEventListener('localNotification', handler);
			AppState.addEventListener('change', nextAppState =>
				this._checkIfOpenedByNotification(nextAppState, handler)
			);
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

		// In the case of opened notifications,
		// the message object should be nested under the 'data' key
		// so as to have the same format as received notifications
		// before it is parsed further in parseMessageData()
		if (from === 'opened') {
			return {
				data: dataObj,
			};
		}

		let ret = dataObj;
		const dataPayload = dataObj.data || {};

		// Consider removing this logic as title and body attributes are not used
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
