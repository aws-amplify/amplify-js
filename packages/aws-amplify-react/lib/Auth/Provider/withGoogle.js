'use strict';
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var __extends =
	(this && this.__extends) ||
	(function() {
		var extendStatics = function(d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function(d, b) {
						d.__proto__ = b;
					}) ||
				function(d, b) {
					for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype =
				b === null
					? Object.create(b)
					: ((__.prototype = b.prototype), new __());
		};
	})();
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
var auth_1 = require('@aws-amplify/auth');
var Amplify_UI_Theme_1 = require('../../Amplify-UI/Amplify-UI-Theme');
var ui_1 = require('@aws-amplify/ui');
var Amplify_UI_Components_React_1 = require('../../Amplify-UI/Amplify-UI-Components-React');
var constants_1 = require('../common/constants');
var logger = new core_1.ConsoleLogger('withGoogle');
function withGoogle(Comp) {
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1(props) {
			var _this = _super.call(this, props) || this;
			_this.initGapi = _this.initGapi.bind(_this);
			_this.signIn = _this.signIn.bind(_this);
			_this.signOut = _this.signOut.bind(_this);
			_this.federatedSignIn = _this.federatedSignIn.bind(_this);
			_this.state = {};
			return _this;
		}
		class_1.prototype.signIn = function() {
			var _this = this;
			var ga = window.gapi.auth2.getAuthInstance();
			var onError = this.props.onError;
			ga.signIn().then(
				function(googleUser) {
					_this.federatedSignIn(googleUser);
					var payload = {
						provider: constants_1.default.GOOGLE,
					};
					try {
						localStorage.setItem(
							constants_1.default.AUTH_SOURCE_KEY,
							JSON.stringify(payload)
						);
					} catch (e) {
						logger.debug('Failed to cache auth source into localStorage', e);
					}
				},
				function(error) {
					if (onError) onError(error);
					else throw error;
				}
			);
		};
		class_1.prototype.federatedSignIn = function(googleUser) {
			return __awaiter(this, void 0, void 0, function() {
				var _a, id_token, expires_at, profile, user, onStateChange;
				return __generator(this, function(_b) {
					switch (_b.label) {
						case 0:
							(_a = googleUser.getAuthResponse()),
								(id_token = _a.id_token),
								(expires_at = _a.expires_at);
							profile = googleUser.getBasicProfile();
							user = {
								email: profile.getEmail(),
								name: profile.getName(),
								picture: profile.getImageUrl(),
							};
							onStateChange = this.props.onStateChange;
							if (
								!auth_1.default ||
								typeof auth_1.default.federatedSignIn !== 'function' ||
								typeof auth_1.default.currentAuthenticatedUser !== 'function'
							) {
								throw new Error(
									'No Auth module found, please ensure @aws-amplify/auth is imported'
								);
							}
							return [
								4 /*yield*/,
								auth_1.default.federatedSignIn(
									'google',
									{ token: id_token, expires_at: expires_at },
									user
								),
							];
						case 1:
							_b.sent();
							return [4 /*yield*/, auth_1.default.currentAuthenticatedUser()];
						case 2:
							user = _b.sent();
							if (onStateChange) {
								onStateChange('signedIn', user);
							}
							return [2 /*return*/];
					}
				});
			});
		};
		class_1.prototype.signOut = function() {
			var authInstance =
				window.gapi && window.gapi.auth2
					? window.gapi.auth2.getAuthInstance()
					: null;
			if (!authInstance) {
				return Promise.resolve();
			}
			authInstance.then(function(googleAuth) {
				if (!googleAuth) {
					logger.debug('google Auth undefined');
					return Promise.resolve();
				}
				logger.debug('google signing out');
				return googleAuth.signOut();
			});
		};
		class_1.prototype.componentDidMount = function() {
			var google_client_id = this.props.google_client_id;
			var ga =
				window.gapi && window.gapi.auth2
					? window.gapi.auth2.getAuthInstance()
					: null;
			if (google_client_id && !ga) this.createScript();
		};
		class_1.prototype.createScript = function() {
			var script = document.createElement('script');
			script.src = 'https://apis.google.com/js/platform.js';
			script.async = true;
			script.onload = this.initGapi;
			document.body.appendChild(script);
		};
		class_1.prototype.initGapi = function() {
			logger.debug('init gapi');
			var that = this;
			var google_client_id = this.props.google_client_id;
			var g = window.gapi;
			g.load('auth2', function() {
				g.auth2.init({
					client_id: google_client_id,
					scope: 'profile email openid',
				});
			});
		};
		class_1.prototype.render = function() {
			var ga =
				window.gapi && window.gapi.auth2
					? window.gapi.auth2.getAuthInstance()
					: null;
			return React.createElement(
				Comp,
				__assign({}, this.props, {
					ga: ga,
					googleSignIn: this.signIn,
					googleSignOut: this.signOut,
				})
			);
		};
		return class_1;
	})(React.Component);
}
exports.default = withGoogle;
var Button = function(props) {
	return React.createElement(
		Amplify_UI_Components_React_1.SignInButton,
		{
			id: ui_1.googleSignInButton,
			onClick: props.googleSignIn,
			theme: props.theme || Amplify_UI_Theme_1.default,
			variant: 'googleSignInButton',
		},
		React.createElement(
			Amplify_UI_Components_React_1.SignInButtonIcon,
			{ theme: props.theme || Amplify_UI_Theme_1.default },
			React.createElement(
				'svg',
				{
					viewBox: '0 0 256 262',
					xmlns: 'http://ww0w.w3.org/2000/svg',
					preserveAspectRatio: 'xMidYMid',
				},
				React.createElement('path', {
					d:
						'M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027',
					fill: '#4285F4',
				}),
				React.createElement('path', {
					d:
						'M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1',
					fill: '#34A853',
				}),
				React.createElement('path', {
					d:
						'M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782',
					fill: '#FBBC05',
				}),
				React.createElement('path', {
					d:
						'M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251',
					fill: '#EB4335',
				})
			)
		),
		React.createElement(
			Amplify_UI_Components_React_1.SignInButtonContent,
			{ theme: props.theme || Amplify_UI_Theme_1.default },
			core_1.I18n.get('Sign In with Google')
		)
	);
};
exports.GoogleButton = withGoogle(Button);
//# sourceMappingURL=withGoogle.js.map
