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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
var auth_1 = require('@aws-amplify/auth');
var Amplify_UI_Theme_1 = require('../../Amplify-UI/Amplify-UI-Theme');
var ui_1 = require('@aws-amplify/ui');
var Amplify_UI_Components_React_1 = require('../../Amplify-UI/Amplify-UI-Components-React');
var constants_1 = require('../common/constants');
var logger = new core_1.ConsoleLogger('withFacebook');
function withFacebook(Comp) {
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1(props) {
			var _this = _super.call(this, props) || this;
			_this.fbAsyncInit = _this.fbAsyncInit.bind(_this);
			_this.initFB = _this.initFB.bind(_this);
			_this.signIn = _this.signIn.bind(_this);
			_this.signOut = _this.signOut.bind(_this);
			_this.federatedSignIn = _this.federatedSignIn.bind(_this);
			_this.state = {};
			return _this;
		}
		class_1.prototype.signIn = function() {
			var _this = this;
			var fb = window.FB;
			fb.getLoginStatus(function(response) {
				var payload = {
					provider: constants_1.default.FACEBOOK,
				};
				try {
					localStorage.setItem(
						constants_1.default.AUTH_SOURCE_KEY,
						JSON.stringify(payload)
					);
				} catch (e) {
					logger.debug('Failed to cache auth source into localStorage', e);
				}
				if (response.status === 'connected') {
					_this.federatedSignIn(response.authResponse);
				} else {
					fb.login(
						function(response) {
							if (!response || !response.authResponse) {
								return;
							}
							_this.federatedSignIn(response.authResponse);
						},
						{
							scope: 'public_profile,email',
						}
					);
				}
			});
		};
		class_1.prototype.federatedSignIn = function(response) {
			logger.debug(response);
			var onStateChange = this.props.onStateChange;
			var accessToken = response.accessToken,
				expiresIn = response.expiresIn;
			var date = new Date();
			var expires_at = expiresIn * 1000 + date.getTime();
			if (!accessToken) {
				return;
			}
			var fb = window.FB;
			fb.api('/me', { fields: 'name,email' }, function(response) {
				var user = {
					name: response.name,
					email: response.email,
				};
				if (
					!auth_1.default ||
					typeof auth_1.default.federatedSignIn !== 'function' ||
					typeof auth_1.default.currentAuthenticatedUser !== 'function'
				) {
					throw new Error(
						'No Auth module found, please ensure @aws-amplify/auth is imported'
					);
				}
				auth_1.default
					.federatedSignIn(
						'facebook',
						{ token: accessToken, expires_at: expires_at },
						user
					)
					.then(function(credentials) {
						return auth_1.default.currentAuthenticatedUser();
					})
					.then(function(authUser) {
						if (onStateChange) {
							onStateChange('signedIn', authUser);
						}
					});
			});
		};
		class_1.prototype.signOut = function() {
			var fb = window.FB;
			if (!fb) {
				logger.debug('FB sdk undefined');
				return Promise.resolve();
			}
			fb.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					return new Promise(function(res, rej) {
						logger.debug('facebook signing out');
						fb.logout(function(response) {
							res(response);
						});
					});
				} else {
					return Promise.resolve();
				}
			});
		};
		class_1.prototype.componentDidMount = function() {
			var facebook_app_id = this.props.facebook_app_id;
			if (facebook_app_id && !window.FB) this.createScript();
		};
		class_1.prototype.fbAsyncInit = function() {
			logger.debug('init FB');
			var facebook_app_id = this.props.facebook_app_id;
			var fb = window.FB;
			fb.init({
				appId: facebook_app_id,
				cookie: true,
				xfbml: true,
				version: 'v2.11',
			});
			fb.getLoginStatus(function(response) {
				return logger.debug(response);
			});
		};
		class_1.prototype.initFB = function() {
			var fb = window.FB;
			logger.debug('FB inited');
		};
		class_1.prototype.createScript = function() {
			window.fbAsyncInit = this.fbAsyncInit;
			var script = document.createElement('script');
			script.src = 'https://connect.facebook.net/en_US/sdk.js';
			script.async = true;
			script.onload = this.initFB;
			document.body.appendChild(script);
		};
		class_1.prototype.render = function() {
			var fb = window.FB;
			return React.createElement(
				Comp,
				__assign({}, this.props, {
					fb: fb,
					facebookSignIn: this.signIn,
					facebookSignOut: this.signOut,
				})
			);
		};
		return class_1;
	})(React.Component);
}
exports.default = withFacebook;
var Button = function(props) {
	return React.createElement(
		Amplify_UI_Components_React_1.SignInButton,
		{
			id: ui_1.facebookSignInButton,
			onClick: props.facebookSignIn,
			theme: props.theme || Amplify_UI_Theme_1.default,
			variant: 'facebookSignInButton',
		},
		React.createElement(
			Amplify_UI_Components_React_1.SignInButtonIcon,
			{ theme: props.theme || Amplify_UI_Theme_1.default },
			React.createElement(
				'svg',
				{ viewBox: '0 0 279 538', xmlns: 'http://www.w3.org/2000/svg' },
				React.createElement(
					'g',
					{ id: 'Page-1', fill: 'none', fillRule: 'evenodd' },
					React.createElement(
						'g',
						{ id: 'Artboard', fill: '#FFF' },
						React.createElement('path', {
							d:
								'M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z',
							id: 'Fill-1',
						})
					)
				)
			)
		),
		React.createElement(
			Amplify_UI_Components_React_1.SignInButtonContent,
			{ theme: props.theme || Amplify_UI_Theme_1.default },
			core_1.I18n.get('Sign In with Facebook')
		)
	);
};
exports.FacebookButton = withFacebook(Button);
//# sourceMappingURL=withFacebook.js.map
