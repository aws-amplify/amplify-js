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
import * as React from 'react';
import { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import {
	NavBar,
	Nav,
	NavRight,
	NavItem,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import SignOut from './SignOut';
import { withGoogle, withAmazon, withFacebook, withAuth0 } from './Provider';
import { UsernameAttributes } from './common/types';
var logger = new Logger('Greetings');
var Greetings = /** @class */ (function(_super) {
	__extends(Greetings, _super);
	function Greetings(props) {
		var _this = _super.call(this, props) || this;
		_this.state = {};
		_this.onHubCapsule = _this.onHubCapsule.bind(_this);
		_this.inGreeting = _this.inGreeting.bind(_this);
		Hub.listen('auth', _this.onHubCapsule);
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
			Auth.currentAuthenticatedUser()
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
			usernameAttributes = _a === void 0 ? UsernameAttributes.USERNAME : _a;
		var prefix =
			usernameAttributes === UsernameAttributes.USERNAME
				? I18n.get('Hello') + ' '
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
			case UsernameAttributes.EMAIL:
				// Email as Username
				name = user.attributes ? user.attributes.email : user.username;
				break;
			case UsernameAttributes.PHONE_NUMBER:
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
			React.createElement(NavItem, { theme: theme }, message),
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
		var config = Auth.configure();
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
		var SignOutComponent = SignOut;
		// @ts-ignore
		if (googleClientId) SignOutComponent = withGoogle(SignOut);
		// @ts-ignore
		if (facebookAppId) SignOutComponent = withFacebook(SignOut);
		// @ts-ignore
		if (amazonClientId) SignOutComponent = withAmazon(SignOut);
		// @ts-ignore
		if (auth0_config) SignOutComponent = withAuth0(SignOut);
		var stateAndProps = Object.assign({}, this.props, this.state);
		return React.createElement(SignOutComponent, __assign({}, stateAndProps));
	};
	Greetings.prototype.noUserGreetings = function(theme) {
		var greeting = this.props.outGreeting || this.outGreeting;
		var message = typeof greeting === 'function' ? greeting() : greeting;
		return message
			? React.createElement(NavItem, { theme: theme }, message)
			: null;
	};
	Greetings.prototype.render = function() {
		var hide = this.props.hide;
		if (hide && hide.includes(Greetings)) {
			return null;
		}
		var authState = this.props.authState || this.state.authState;
		var signedIn = authState === 'signedIn';
		var theme = this.props.theme || AmplifyTheme;
		var greeting = signedIn
			? this.userGreetings(theme)
			: this.noUserGreetings(theme);
		if (!greeting) {
			return null;
		}
		return React.createElement(
			NavBar,
			{ theme: theme, 'data-test': auth.greetings.navBar },
			React.createElement(
				Nav,
				{ theme: theme, 'data-test': auth.greetings.nav },
				React.createElement(
					NavRight,
					{ theme: theme, 'data-test': auth.greetings.navRight },
					greeting
				)
			)
		);
	};
	return Greetings;
})(AuthPiece);
export default Greetings;
//# sourceMappingURL=Greetings.js.map
