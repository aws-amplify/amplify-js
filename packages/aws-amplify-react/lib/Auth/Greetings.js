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
var AuthPiece_1 = require('./AuthPiece');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var Amplify_UI_Theme_1 = require('../Amplify-UI/Amplify-UI-Theme');
var SignOut_1 = require('./SignOut');
var Provider_1 = require('./Provider');
var types_1 = require('./common/types');
var logger = new core_1.ConsoleLogger('Greetings');
var Greetings = /** @class */ (function(_super) {
	__extends(Greetings, _super);
	function Greetings(props) {
		var _this = _super.call(this, props) || this;
		_this.state = {};
		_this.onHubCapsule = _this.onHubCapsule.bind(_this);
		_this.inGreeting = _this.inGreeting.bind(_this);
		core_1.Hub.listen('auth', _this.onHubCapsule);
		_this._validAuthStates = ['signedIn'];
		return _this;
	}
	Greetings.prototype.componentDidMount = function() {
		this._isMounted = true;
		this.findState();
	};
	Greetings.prototype.componentWillUnmount = function() {
		this._isMounted = false;
	};
	Greetings.prototype.findState = function() {
		var _this = this;
		if (!this.props.authState && !this.props.authData) {
			auth_1.default
				.currentAuthenticatedUser()
				.then(function(user) {
					_this.setState({
						authState: 'signedIn',
						authData: user,
						stateFromStorage: true,
					});
				})
				.catch(function(err) {
					return logger.debug(err);
				});
		}
	};
	Greetings.prototype.onHubCapsule = function(capsule) {
		if (this._isMounted) {
			var channel = capsule.channel,
				payload = capsule.payload;
			if (channel === 'auth' && payload.event === 'signIn') {
				this.setState({
					authState: 'signedIn',
					authData: payload.data,
				});
				if (!this.props.authState) {
					this.setState({ stateFromStorage: true });
				}
			} else if (
				channel === 'auth' &&
				payload.event === 'signOut' &&
				!this.props.authState
			) {
				this.setState({
					authState: 'signIn',
				});
			}
		}
	};
	Greetings.prototype.inGreeting = function(name) {
		var _a = this.props.usernameAttributes,
			usernameAttributes =
				_a === void 0 ? types_1.UsernameAttributes.USERNAME : _a;
		var prefix =
			usernameAttributes === types_1.UsernameAttributes.USERNAME
				? core_1.I18n.get('Hello') + ' '
				: '';
		return '' + prefix + name;
	};
	Greetings.prototype.outGreeting = function() {
		return '';
	};
	Greetings.prototype.userGreetings = function(theme) {
		var user = this.props.authData || this.state.authData;
		var greeting = this.props.inGreeting || this.inGreeting;
		// get name from attributes first
		var _a = this.props.usernameAttributes,
			usernameAttributes = _a === void 0 ? 'username' : _a;
		var name = '';
		switch (usernameAttributes) {
			case types_1.UsernameAttributes.EMAIL:
				// Email as Username
				name = user.attributes ? user.attributes.email : user.username;
				break;
			case types_1.UsernameAttributes.PHONE_NUMBER:
				// Phone number as Username
				name = user.attributes ? user.attributes.phone_number : user.username;
				break;
			default:
				var nameFromAttr = user.attributes
					? user.attributes.name ||
					  (user.attributes.given_name
							? user.attributes.given_name + ' ' + user.attributes.family_name
							: undefined)
					: undefined;
				name = nameFromAttr || user.name || user.username;
				break;
		}
		var message = typeof greeting === 'function' ? greeting(name) : greeting;
		return React.createElement(
			'span',
			null,
			React.createElement(
				Amplify_UI_Components_React_1.NavItem,
				{ theme: theme },
				message
			),
			this.renderSignOutButton()
		);
	};
	Greetings.prototype.renderSignOutButton = function() {
		var _a = this.props.federated,
			federated = _a === void 0 ? {} : _a;
		var google_client_id = federated.google_client_id,
			facebook_app_id = federated.facebook_app_id,
			amazon_client_id = federated.amazon_client_id,
			auth0 = federated.auth0;
		// @ts-ignore
		var config = auth_1.default.configure();
		var _b = config.oauth,
			oauth = _b === void 0 ? {} : _b;
		// @ts-ignore
		var googleClientId = google_client_id || config.googleClientId;
		// @ts-ignore
		var facebookAppId = facebook_app_id || config.facebookClientId;
		// @ts-ignore
		var amazonClientId = amazon_client_id || config.amazonClientId;
		// @ts-ignore
		var auth0_config = auth0 || oauth.auth0;
		var SignOutComponent = SignOut_1.default;
		// @ts-ignore
		if (googleClientId)
			SignOutComponent = Provider_1.withGoogle(SignOut_1.default);
		// @ts-ignore
		if (facebookAppId)
			SignOutComponent = Provider_1.withFacebook(SignOut_1.default);
		// @ts-ignore
		if (amazonClientId)
			SignOutComponent = Provider_1.withAmazon(SignOut_1.default);
		// @ts-ignore
		if (auth0_config)
			SignOutComponent = Provider_1.withAuth0(SignOut_1.default);
		var stateAndProps = Object.assign({}, this.props, this.state);
		return React.createElement(SignOutComponent, __assign({}, stateAndProps));
	};
	Greetings.prototype.noUserGreetings = function(theme) {
		var greeting = this.props.outGreeting || this.outGreeting;
		var message = typeof greeting === 'function' ? greeting() : greeting;
		return message
			? React.createElement(
					Amplify_UI_Components_React_1.NavItem,
					{ theme: theme },
					message
			  )
			: null;
	};
	Greetings.prototype.render = function() {
		var hide = this.props.hide;
		if (hide && hide.includes(Greetings)) {
			return null;
		}
		var authState = this.props.authState || this.state.authState;
		var signedIn = authState === 'signedIn';
		var theme = this.props.theme || Amplify_UI_Theme_1.default;
		var greeting = signedIn
			? this.userGreetings(theme)
			: this.noUserGreetings(theme);
		if (!greeting) {
			return null;
		}
		return React.createElement(
			Amplify_UI_Components_React_1.NavBar,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.greetings.navBar,
			},
			React.createElement(
				Amplify_UI_Components_React_1.Nav,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.greetings.nav,
				},
				React.createElement(
					Amplify_UI_Components_React_1.NavRight,
					{
						theme: theme,
						'data-test': data_test_attributes_1.auth.greetings.navRight,
					},
					greeting
				)
			)
		);
	};
	return Greetings;
})(AuthPiece_1.default);
exports.default = Greetings;
//# sourceMappingURL=Greetings.js.map
