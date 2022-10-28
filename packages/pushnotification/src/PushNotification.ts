// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
		const { eventSource, eventSourceAttributes } =
			this.parseMessageData(rawMessage);

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
		const { eventSource, eventSourceAttributes } =
			this.parseMessageData(rawMessage);

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
