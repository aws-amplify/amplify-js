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
import * as React from 'react';
import { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import { NavButton } from '../Amplify-UI/Amplify-UI-Components-React';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import Constants from './common/constants';
import { auth } from '../Amplify-UI/data-test-attributes';
var logger = new Logger('SignOut');
var SignOut = /** @class */ (function(_super) {
	__extends(SignOut, _super);
	function SignOut(props) {
		var _this = _super.call(this, props) || this;
		_this.signOut = _this.signOut.bind(_this);
		_this.onHubCapsule = _this.onHubCapsule.bind(_this);
		Hub.listen('auth', _this.onHubCapsule);
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
			Auth.currentAuthenticatedUser()
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
				JSON.parse(localStorage.getItem(Constants.AUTH_SOURCE_KEY)) || {};
			localStorage.removeItem(Constants.AUTH_SOURCE_KEY);
		} catch (e) {
			logger.debug(
				'Failed to parse the info from ' +
					Constants.AUTH_SOURCE_KEY +
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
			case Constants.GOOGLE:
				if (googleSignOut) googleSignOut();
				else logger.debug('No Google signout method provided');
				break;
			case Constants.FACEBOOK:
				if (facebookSignOut) facebookSignOut();
				else logger.debug('No Facebook signout method provided');
				break;
			case Constants.AMAZON:
				if (amazonSignOut) amazonSignOut();
				else logger.debug('No Amazon signout method provided');
				break;
			case Constants.AUTH0:
				// @ts-ignore
				if (auth0SignOut) auth0SignOut(payload.opts);
				else logger.debug('No Auth0 signout method provided');
				break;
			default:
				break;
		}
		if (!Auth || typeof Auth.signOut !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.signOut()
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
		var theme = this.props.theme || AmplifyTheme;
		if (!signedIn) {
			return null;
		}
		return React.createElement(
			NavButton,
			{ theme: theme, onClick: this.signOut, 'data-test': auth.signOut.button },
			I18n.get('Sign Out')
		);
	};
	return SignOut;
})(AuthPiece);
export default SignOut;
//# sourceMappingURL=SignOut.js.map
