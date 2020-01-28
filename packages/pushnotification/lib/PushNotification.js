'use strict';
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
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
var __importDefault =
	(this && this.__importDefault) ||
	function(mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
var __importStar =
	(this && this.__importStar) ||
	function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null)
			for (var k in mod)
				if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
		result['default'] = mod;
		return result;
	};
Object.defineProperty(exports, '__esModule', { value: true });
var react_native_1 = require('react-native');
var push_notification_ios_1 = __importDefault(
	require('@react-native-community/push-notification-ios')
);
var core_1 = __importStar(require('@aws-amplify/core'));
var logger = new core_1.ConsoleLogger('Notification');
var RNPushNotification = react_native_1.NativeModules.RNPushNotification;
var REMOTE_NOTIFICATION_RECEIVED = 'remoteNotificationReceived';
var REMOTE_TOKEN_RECEIVED = 'remoteTokenReceived';
var REMOTE_NOTIFICATION_OPENED = 'remoteNotificationOpened';
var PushNotification = /** @class */ (function() {
	function PushNotification(config) {
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
		this._currentState = react_native_1.AppState.currentState;
		this._androidInitialized = false;
		this._iosInitialized = false;
		if (react_native_1.Platform.OS === 'ios') {
			react_native_1.AppState.addEventListener(
				'change',
				this._checkIfOpenedByCampaign,
				false
			);
		}
	}
	PushNotification.prototype.getModuleName = function() {
		return 'Pushnotification';
	};
	PushNotification.prototype.configure = function(config) {
		var conf = config ? config.PushNotification || config : {};
		if (conf['aws_mobile_analytics_app_id']) {
			conf = {
				appId: conf['aws_mobile_analytics_app_id'],
			};
		}
		this._config = Object.assign(
			{
				// defaults
				requestIOSPermissions: true,
			},
			this._config,
			conf
		);
		if (react_native_1.Platform.OS === 'android' && !this._androidInitialized) {
			this.initializeAndroid();
			this._androidInitialized = true;
		} else if (react_native_1.Platform.OS === 'ios' && !this._iosInitialized) {
			this.initializeIOS();
			this._iosInitialized = true;
		}
	};
	PushNotification.prototype.onNotification = function(handler) {
		if (typeof handler === 'function') {
			// check platform
			if (react_native_1.Platform.OS === 'ios') {
				this.addEventListenerForIOS(REMOTE_NOTIFICATION_RECEIVED, handler);
			} else {
				this.addEventListenerForAndroid(REMOTE_NOTIFICATION_RECEIVED, handler);
			}
		}
	};
	PushNotification.prototype.onNotificationOpened = function(handler) {
		if (typeof handler === 'function') {
			// check platform
			if (react_native_1.Platform.OS === 'android') {
				this.addEventListenerForAndroid(REMOTE_NOTIFICATION_OPENED, handler);
			}
		}
	};
	PushNotification.prototype.onRegister = function(handler) {
		if (typeof handler === 'function') {
			// check platform
			if (react_native_1.Platform.OS === 'ios') {
				this.addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, handler);
			} else {
				this.addEventListenerForAndroid(REMOTE_TOKEN_RECEIVED, handler);
			}
		}
	};
	PushNotification.prototype.initializeAndroid = function() {
		return __awaiter(this, void 0, void 0, function() {
			var appId, cacheKey;
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						this.addEventListenerForAndroid(
							REMOTE_TOKEN_RECEIVED,
							this.updateEndpoint
						);
						this.addEventListenerForAndroid(
							REMOTE_NOTIFICATION_OPENED,
							this.handleCampaignOpened
						);
						this.addEventListenerForAndroid(
							REMOTE_NOTIFICATION_RECEIVED,
							this.handleCampaignPush
						);
						RNPushNotification.initialize();
						return [4 /*yield*/, this._registerTokenCached()];
					case 1:
						// check if the token is cached properly
						if (!_a.sent()) {
							appId = this._config.appId;
							cacheKey = 'push_token' + appId;
							RNPushNotification.getToken(function(token) {
								logger.debug('Get the token from Firebase Service', token);
								// resend the token in case it's missing in the Pinpoint service
								// the token will also be cached locally
								_this.updateEndpoint(token);
							});
						}
						return [2 /*return*/];
				}
			});
		});
	};
	PushNotification.prototype._registerTokenCached = function() {
		return __awaiter(this, void 0, void 0, function() {
			var appId, cacheKey;
			return __generator(this, function(_a) {
				appId = this._config.appId;
				cacheKey = 'push_token' + appId;
				return [
					2 /*return*/,
					react_native_1.AsyncStorage.getItem(cacheKey).then(function(
						lastToken
					) {
						if (lastToken) return true;
						else return false;
					}),
				];
			});
		});
	};
	PushNotification.prototype.requestIOSPermissions = function(options) {
		if (options === void 0) {
			options = { alert: true, badge: true, sound: true };
		}
		push_notification_ios_1.default.requestPermissions(options);
	};
	PushNotification.prototype.initializeIOS = function() {
		if (this._config.requestIOSPermissions) {
			this.requestIOSPermissions();
		}
		this.addEventListenerForIOS(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
		this.addEventListenerForIOS(
			REMOTE_NOTIFICATION_RECEIVED,
			this.handleCampaignPush
		);
	};
	PushNotification.prototype._checkIfOpenedByCampaign = function(nextAppState) {
		var _this = this;
		// the app is turned from background to foreground
		if (
			this._currentState.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			push_notification_ios_1.default
				.getInitialNotification()
				.then(function(data) {
					if (data) {
						_this.handleCampaignOpened(data);
					}
				})
				.catch(function(e) {
					logger.debug('Failed to get the initial notification.', e);
				});
		}
		this._currentState = nextAppState;
	};
	PushNotification.prototype.handleCampaignPush = function(rawMessage) {
		var message = rawMessage;
		var campaign = null;
		if (react_native_1.Platform.OS === 'ios') {
			message = this.parseMessageFromIOS(rawMessage);
			campaign =
				message && message.data && message.data.pinpoint
					? message.data.pinpoint.campaign
					: null;
		} else if (react_native_1.Platform.OS === 'android') {
			var data = rawMessage.data;
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
		var attributes = {
			campaign_activity_id: campaign['campaign_activity_id'],
			isAppInForeground: message.foreground ? 'true' : 'false',
			treatment_id: campaign['treatment_id'],
			campaign_id: campaign['campaign_id'],
		};
		var eventType = message.foreground
			? '_campaign.received_foreground'
			: '_campaign.received_background';
		if (
			core_1.default.Analytics &&
			typeof core_1.default.Analytics.record === 'function'
		) {
			core_1.default.Analytics.record({
				name: eventType,
				attributes: attributes,
				immediate: true,
			});
		} else {
			logger.debug('Analytics module is not registered into Amplify');
		}
	};
	PushNotification.prototype.handleCampaignOpened = function(rawMessage) {
		logger.debug('handleCampaignOpened, raw data', rawMessage);
		var campaign = null;
		if (react_native_1.Platform.OS === 'ios') {
			var message = this.parseMessageFromIOS(rawMessage);
			campaign =
				message && message.data && message.data.pinpoint
					? message.data.pinpoint.campaign
					: null;
		} else if (react_native_1.Platform.OS === 'android') {
			var data = rawMessage;
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
		var attributes = {
			campaign_activity_id: campaign['campaign_activity_id'],
			treatment_id: campaign['treatment_id'],
			campaign_id: campaign['campaign_id'],
		};
		var eventType = '_campaign.opened_notification';
		if (
			core_1.default.Analytics &&
			typeof core_1.default.Analytics.record === 'function'
		) {
			core_1.default.Analytics.record({
				name: eventType,
				attributes: attributes,
				immediate: true,
			});
		} else {
			logger.debug('Analytics module is not registered into Amplify');
		}
	};
	PushNotification.prototype.updateEndpoint = function(token) {
		if (!token) {
			logger.debug('no device token recieved on register');
			return;
		}
		var appId = this._config.appId;
		var cacheKey = 'push_token' + appId;
		logger.debug('update endpoint in push notification', token);
		react_native_1.AsyncStorage.getItem(cacheKey)
			.then(function(lastToken) {
				if (!lastToken || lastToken !== token) {
					logger.debug('refresh the device token with', token);
					var config = {
						Address: token,
						OptOut: 'NONE',
					};
					if (
						core_1.default.Analytics &&
						typeof core_1.default.Analytics.updateEndpoint === 'function'
					) {
						core_1.default.Analytics.updateEndpoint(config)
							.then(function(data) {
								logger.debug(
									'update endpoint success, setting token into cache'
								);
								react_native_1.AsyncStorage.setItem(cacheKey, token);
							})
							.catch(function(e) {
								// ........
								logger.debug('update endpoint failed', e);
							});
					} else {
						logger.debug('Analytics module is not registered into Amplify');
					}
				}
			})
			.catch(function(e) {
				logger.debug('set device token in cache failed', e);
			});
	};
	// only for android
	PushNotification.prototype.addEventListenerForAndroid = function(
		event,
		handler
	) {
		var that = this;
		var listener = react_native_1.DeviceEventEmitter.addListener(
			event,
			function(data) {
				// for on notification
				if (event === REMOTE_NOTIFICATION_RECEIVED) {
					handler(that.parseMessagefromAndroid(data));
					return;
				}
				if (event === REMOTE_TOKEN_RECEIVED) {
					var dataObj = data.dataJSON ? JSON.parse(data.dataJSON) : {};
					handler(dataObj.refreshToken);
					return;
				}
				if (event === REMOTE_NOTIFICATION_OPENED) {
					handler(that.parseMessagefromAndroid(data, 'opened'));
					return;
				}
			}
		);
	};
	PushNotification.prototype.addEventListenerForIOS = function(event, handler) {
		var that = this;
		if (event === REMOTE_TOKEN_RECEIVED) {
			push_notification_ios_1.default.addEventListener('register', function(
				data
			) {
				handler(data);
			});
		}
		if (event === REMOTE_NOTIFICATION_RECEIVED) {
			push_notification_ios_1.default.addEventListener('notification', handler);
		}
	};
	PushNotification.prototype.parseMessagefromAndroid = function(message, from) {
		var dataObj = null;
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
		var ret = null;
		var dataPayload = dataObj.data || {};
		if (dataPayload['pinpoint.campaign.campaign_id']) {
			ret = {
				title: dataPayload['pinpoint.notification.title'],
				body: dataPayload['pinpoint.notification.body'],
				data: dataPayload,
				foreground: dataObj.foreground,
			};
		}
		return ret;
	};
	PushNotification.prototype.parseMessageFromIOS = function(message) {
		var _data = message && message._data ? message._data : null;
		var _alert = message && message._alert ? message._alert : {};
		if (!_data && !_alert) {
			logger.debug('no notification payload received');
			return {};
		}
		var data = _data.data;
		var title = _alert.title;
		var body = _alert.body;
		var ret = null;
		ret = {
			title: title,
			body: body,
			data: data,
		};
		return ret;
	};
	return PushNotification;
})();
exports.default = PushNotification;
//# sourceMappingURL=PushNotification.js.map
