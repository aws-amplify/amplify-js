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
// import auth0 from 'auth0-js';
var ui_1 = require('@aws-amplify/ui');
var Amplify_UI_Components_React_1 = require('../../Amplify-UI/Amplify-UI-Components-React');
var constants_1 = require('../common/constants');
var logger = new core_1.ConsoleLogger('withAuth0');
function withAuth0(Comp, options) {
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1(props) {
			var _this = _super.call(this, props) || this;
			_this._auth0 = null;
			_this.initialize = _this.initialize.bind(_this);
			_this.signIn = _this.signIn.bind(_this);
			_this.signOut = _this.signOut.bind(_this);
			return _this;
		}
		class_1.prototype.componentDidMount = function() {
			if (!window.auth0) {
				this.createScript();
			} else {
				this.initialize();
			}
		};
		class_1.prototype.createScript = function() {
			var script = document.createElement('script');
			script.src = 'https://cdn.auth0.com/js/auth0/9.8.1/auth0.min.js';
			script.async = true;
			script.onload = this.initialize;
			document.body.appendChild(script);
		};
		class_1.prototype.initialize = function() {
			var _this = this;
			// @ts-ignore
			var _a = auth_1.default.configure().oauth,
				oauth = _a === void 0 ? {} : _a;
			// @ts-ignore
			var config = this.props.auth0 || options || oauth.auth0;
			var _b = this.props,
				onError = _b.onError,
				onStateChange = _b.onStateChange,
				authState = _b.authState;
			if (!config) {
				logger.debug('Auth0 is not configured');
				return;
			}
			logger.debug('withAuth0 configuration', config);
			if (!this._auth0) {
				this._auth0 = new window['auth0'].WebAuth(config);
				window.auth0_client = this._auth0;
			}
			if (authState !== 'signedIn') {
				this._auth0.parseHash(function(err, authResult) {
					if (err || !authResult) {
						logger.debug('Failed to parse the url for Auth0', err);
						return;
					}
					var payload = {
						provider: constants_1.default.AUTH0,
						opts: {
							returnTo: config.returnTo,
							clientID: config.clientID,
							federated: config.federated,
						},
					};
					try {
						localStorage.setItem(
							constants_1.default.AUTH_SOURCE_KEY,
							JSON.stringify(payload)
						);
					} catch (e) {
						logger.debug('Failed to cache auth source into localStorage', e);
					}
					_this._auth0.client.userInfo(authResult.accessToken, function(
						err,
						user
					) {
						var username = undefined;
						var email = undefined;
						if (err) {
							logger.debug('Failed to get the user info', err);
						} else {
							username = user.name;
							email = user.email;
						}
						auth_1.default
							.federatedSignIn(
								config.domain,
								{
									token: authResult.idToken,
									expires_at:
										authResult.expiresIn * 1000 + new Date().getTime(),
								},
								{ name: username, email: email }
							)
							.then(function() {
								if (onStateChange) {
									auth_1.default
										.currentAuthenticatedUser()
										.then(function(user) {
											onStateChange('signedIn', user);
										});
								}
							})
							.catch(function(e) {
								logger.debug('Failed to get the aws credentials', e);
								if (onError) onError(e);
							});
					});
				});
			}
		};
		class_1.prototype.signIn = function() {
			return __awaiter(this, void 0, void 0, function() {
				return __generator(this, function(_a) {
					if (this._auth0) this._auth0.authorize();
					else {
						throw new Error('the auth0 client is not configured');
					}
					return [2 /*return*/];
				});
			});
		};
		class_1.prototype.signOut = function(opts) {
			if (opts === void 0) {
				opts = {};
			}
			var auth0 = window.auth0_client;
			// @ts-ignore
			var returnTo = opts.returnTo,
				clientID = opts.clientID,
				federated = opts.federated;
			if (!auth0) {
				logger.debug('auth0 sdk undefined');
				return Promise.resolve();
			}
			auth0.logout({
				returnTo: returnTo,
				clientID: clientID,
				federated: federated,
			});
		};
		class_1.prototype.render = function() {
			return React.createElement(
				Comp,
				__assign({}, this.props, {
					auth0: this._auth0,
					auth0SignIn: this.signIn,
					auth0SignOut: this.signOut,
				})
			);
		};
		return class_1;
	})(React.Component);
}
exports.default = withAuth0;
var Button = function(props) {
	return React.createElement(
		Amplify_UI_Components_React_1.SignInButton,
		{
			id: ui_1.auth0SignInButton,
			onClick: props.auth0SignIn,
			theme: props.theme || Amplify_UI_Theme_1.default,
			variant: 'auth0SignInButton',
		},
		React.createElement(
			Amplify_UI_Components_React_1.SignInButtonIcon,
			{ theme: props.theme || Amplify_UI_Theme_1.default },
			React.createElement(
				'svg',
				{
					id: 'artwork',
					xmlns: 'http://www.w3.org/2000/svg',
					viewBox: '0 0 193.7 216.6',
				},
				React.createElement('path', {
					id: 'NEW',
					className: 'st0',
					d:
						'M189,66.9L167.2,0H96.8l21.8,66.9H189z M96.8,0H26.5L4.8,66.9h70.4L96.8,0z M4.8,66.9L4.8,66.9\tc-13,39.9,1.2,83.6,35.2,108.3l21.7-66.9L4.8,66.9z M189,66.9L189,66.9l-57,41.4l21.7,66.9l0,0C187.7,150.6,201.9,106.8,189,66.9\tL189,66.9z M39.9,175.2L39.9,175.2l56.9,41.4l56.9-41.4l-56.9-41.4L39.9,175.2z',
				})
			)
		),
		React.createElement(
			Amplify_UI_Components_React_1.SignInButtonContent,
			{ theme: props.theme || Amplify_UI_Theme_1.default },
			props.label || 'Sign In with Auth0'
		)
	);
};
exports.Auth0Button = withAuth0(Button);
//# sourceMappingURL=withAuth0.js.map
