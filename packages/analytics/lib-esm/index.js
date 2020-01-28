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
import AnalyticsClass from './Analytics';
import Amplify, { ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
var logger = new Logger('Analytics');
var endpointUpdated = false;
var authConfigured = false;
var analyticsConfigured = false;
var _instance = null;
if (!_instance) {
	logger.debug('Create Analytics Instance');
	_instance = new AnalyticsClass();
}
var Analytics = _instance;
Amplify.register(Analytics);
export default Analytics;
export { AnalyticsClass };
export * from './Providers';
var listener = function(capsule) {
	var channel = capsule.channel,
		payload = capsule.payload,
		source = capsule.source;
	logger.debug('on hub capsule ' + channel, payload);
	switch (channel) {
		case 'auth':
			authEvent(payload);
			break;
		case 'storage':
			storageEvent(payload);
			break;
		case 'analytics':
			analyticsEvent(payload);
			break;
		default:
			break;
	}
};
var storageEvent = function(payload) {
	var _a = payload.data,
		attrs = _a.attrs,
		metrics = _a.metrics;
	if (!attrs) return;
	if (analyticsConfigured) {
		Analytics.record({
			name: 'Storage',
			attributes: attrs,
			metrics: metrics,
		}).catch(function(e) {
			logger.debug('Failed to send the storage event automatically', e);
		});
	}
};
var authEvent = function(payload) {
	var event = payload.event;
	if (!event) {
		return;
	}
	var recordAuthEvent = function(eventName) {
		return __awaiter(void 0, void 0, void 0, function() {
			var err_1;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						if (!(authConfigured && analyticsConfigured))
							return [3 /*break*/, 4];
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 4]);
						return [
							4 /*yield*/,
							Analytics.record({ name: '_userauth.' + eventName }),
						];
					case 2:
						return [2 /*return*/, _a.sent()];
					case 3:
						err_1 = _a.sent();
						logger.debug(
							'Failed to send the ' + eventName + ' event automatically',
							err_1
						);
						return [3 /*break*/, 4];
					case 4:
						return [2 /*return*/];
				}
			});
		});
	};
	switch (event) {
		case 'signIn':
			return recordAuthEvent('sign_in');
		case 'signUp':
			return recordAuthEvent('sign_up');
		case 'signOut':
			return recordAuthEvent('sign_out');
		case 'signIn_failure':
			return recordAuthEvent('auth_fail');
		case 'configured':
			authConfigured = true;
			if (authConfigured && analyticsConfigured) {
				sendEvents();
			}
			break;
	}
};
var analyticsEvent = function(payload) {
	var event = payload.event;
	if (!event) return;
	switch (event) {
		case 'pinpointProvider_configured':
			analyticsConfigured = true;
			if (authConfigured && analyticsConfigured) {
				sendEvents();
			}
			break;
	}
};
var sendEvents = function() {
	var config = Analytics.configure();
	if (!endpointUpdated && config['autoSessionRecord']) {
		Analytics.updateEndpoint({ immediate: true }).catch(function(e) {
			logger.debug('Failed to update the endpoint', e);
		});
		endpointUpdated = true;
	}
	Analytics.autoTrack('session', {
		enable: config['autoSessionRecord'],
	});
};
Hub.listen('auth', listener);
Hub.listen('storage', listener);
Hub.listen('analytics', listener);
//# sourceMappingURL=index.js.map
