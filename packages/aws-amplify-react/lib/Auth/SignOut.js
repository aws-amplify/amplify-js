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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
var auth_1 = require('@aws-amplify/auth');
var AuthPiece_1 = require('./AuthPiece');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var Amplify_UI_Theme_1 = require('../Amplify-UI/Amplify-UI-Theme');
var constants_1 = require('./common/constants');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var logger = new core_1.ConsoleLogger('SignOut');
var SignOut = /** @class */ (function(_super) {
	__extends(SignOut, _super);
	function SignOut(props) {
		var _this = _super.call(this, props) || this;
		_this.signOut = _this.signOut.bind(_this);
		_this.onHubCapsule = _this.onHubCapsule.bind(_this);
		core_1.Hub.listen('auth', _this.onHubCapsule);
		_this.state = {};
		return _this;
	}
	SignOut.prototype.componentDidMount = function() {
		this._isMounted = true;
		this.findState();
	};
	SignOut.prototype.componentWillUnmount = function() {
		this._isMounted = false;
	};
	SignOut.prototype.findState = function() {
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
					return logger.error(err);
				});
		} else if (this.props.stateFromStorage) {
			this.setState({
				stateFromStorage: true,
			});
		}
	};
	SignOut.prototype.onHubCapsule = function(capsule) {
		if (this._isMounted) {
			var channel = capsule.channel,
				payload = capsule.payload,
				source = capsule.source;
			if (channel === 'auth' && payload.event === 'signIn') {
				this.setState({
					authState: 'signedIn',
					authData: payload.data,
				});
			} else if (
				channel === 'auth' &&
				payload.event === 'signOut' &&
				!this.props.authState
			) {
				this.setState({
					authState: 'signIn',
				});
			}
			if (
				channel === 'auth' &&
				payload.event === 'signIn' &&
				!this.props.authState
			) {
				this.setState({ stateFromStorage: true });
			}
		}
	};
	SignOut.prototype.signOut = function() {
		var _this = this;
		var payload = {};
		try {
			payload =
				JSON.parse(localStorage.getItem(constants_1.default.AUTH_SOURCE_KEY)) ||
				{};
			localStorage.removeItem(constants_1.default.AUTH_SOURCE_KEY);
		} catch (e) {
			logger.debug(
				'Failed to parse the info from ' +
					constants_1.default.AUTH_SOURCE_KEY +
					' from localStorage with ' +
					e
			);
		}
		logger.debug('sign out from the source', payload);
		var _a = this.props,
			googleSignOut = _a.googleSignOut,
			facebookSignOut = _a.facebookSignOut,
			amazonSignOut = _a.amazonSignOut,
			auth0SignOut = _a.auth0SignOut;
		// @ts-ignore
		switch (payload.provider) {
			case constants_1.default.GOOGLE:
				if (googleSignOut) googleSignOut();
				else logger.debug('No Google signout method provided');
				break;
			case constants_1.default.FACEBOOK:
				if (facebookSignOut) facebookSignOut();
				else logger.debug('No Facebook signout method provided');
				break;
			case constants_1.default.AMAZON:
				if (amazonSignOut) amazonSignOut();
				else logger.debug('No Amazon signout method provided');
				break;
			case constants_1.default.AUTH0:
				// @ts-ignore
				if (auth0SignOut) auth0SignOut(payload.opts);
				else logger.debug('No Auth0 signout method provided');
				break;
			default:
				break;
		}
		if (!auth_1.default || typeof auth_1.default.signOut !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.signOut()
			.then(function() {
				if (!_this.state.stateFromStorage) {
					_this.changeState('signedOut');
				}
			})
			.catch(function(err) {
				logger.debug(err);
				_this.error(err);
			});
	};
	SignOut.prototype.render = function() {
		var hide = this.props.hide;
		if (hide && hide.includes(SignOut)) {
			return null;
		}
		var authState = this.props.authState || this.state.authState;
		var signedIn = authState === 'signedIn';
		var theme = this.props.theme || Amplify_UI_Theme_1.default;
		if (!signedIn) {
			return null;
		}
		return React.createElement(
			Amplify_UI_Components_React_1.NavButton,
			{
				theme: theme,
				onClick: this.signOut,
				'data-test': data_test_attributes_1.auth.signOut.button,
			},
			core_1.I18n.get('Sign Out')
		);
	};
	return SignOut;
})(AuthPiece_1.default);
exports.default = SignOut;
//# sourceMappingURL=SignOut.js.map
