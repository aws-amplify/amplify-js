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
import * as React from 'react';
import Amplify, { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import Greetings from './Greetings';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import RequireNewPassword from './RequireNewPassword';
import SignUp from './SignUp';
import Loading from './Loading';
import ConfirmSignUp from './ConfirmSignUp';
import VerifyContact from './VerifyContact';
import ForgotPassword from './ForgotPassword';
import TOTPSetup from './TOTPSetup';
import Constants from './common/constants';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import AmplifyMessageMap from '../AmplifyMessageMap';
import { Container, Toast } from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
var logger = new Logger('Authenticator');
var AUTHENTICATOR_AUTHSTATE = 'amplify-authenticator-authState';
export var EmptyContainer = function(_a) {
	var children = _a.children;
	return React.createElement(React.Fragment, null, children);
};
var Authenticator = /** @class */ (function(_super) {
	__extends(Authenticator, _super);
	function Authenticator(props) {
		var _this = _super.call(this, props) || this;
		_this.handleStateChange = _this.handleStateChange.bind(_this);
		_this.handleAuthEvent = _this.handleAuthEvent.bind(_this);
		_this.onHubCapsule = _this.onHubCapsule.bind(_this);
		_this._initialAuthState = _this.props.authState || 'signIn';
		_this.state = { authState: 'loading' };
		Hub.listen('auth', _this.onHubCapsule);
		return _this;
	}
	Authenticator.prototype.componentDidMount = function() {
		var config = this.props.amplifyConfig;
		if (config) {
			Amplify.configure(config);
		}
		this._isMounted = true;
		// The workaround for Cognito Hosted UI:
		// Don't check the user immediately if redirected back from Hosted UI as
		// it might take some time for credentials to be available, instead
		// wait for the hub event sent from Auth module. This item in the
		// localStorage is a mark to indicate whether the app is just redirected
		// back from Hosted UI or not and is set in Auth:handleAuthResponse.
		var byHostedUI = localStorage.getItem(Constants.REDIRECTED_FROM_HOSTED_UI);
		localStorage.removeItem(Constants.REDIRECTED_FROM_HOSTED_UI);
		if (byHostedUI !== 'true') this.checkUser();
	};
	Authenticator.prototype.componentWillUnmount = function() {
		this._isMounted = false;
	};
	Authenticator.prototype.checkUser = function() {
		var _this = this;
		if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		return Auth.currentAuthenticatedUser()
			.then(function(user) {
				if (!_this._isMounted) {
					return;
				}
				_this.handleStateChange('signedIn', user);
			})
			.catch(function(err) {
				if (!_this._isMounted) {
					return;
				}
				var cachedAuthState = null;
				try {
					cachedAuthState = localStorage.getItem(AUTHENTICATOR_AUTHSTATE);
				} catch (e) {
					logger.debug('Failed to get the auth state from local storage', e);
				}
				var promise =
					cachedAuthState === 'signedIn' ? Auth.signOut() : Promise.resolve();
				promise
					.then(function() {
						return _this.handleStateChange(_this._initialAuthState);
					})
					.catch(function(e) {
						logger.debug('Failed to sign out', e);
					});
			});
	};
	Authenticator.prototype.onHubCapsule = function(capsule) {
		var channel = capsule.channel,
			payload = capsule.payload,
			source = capsule.source;
		if (channel === 'auth') {
			switch (payload.event) {
				case 'cognitoHostedUI':
					this.handleStateChange('signedIn', payload.data);
					break;
				case 'cognitoHostedUI_failure':
					this.handleStateChange('signIn', null);
					break;
				case 'parsingUrl_failure':
					this.handleStateChange('signIn', null);
					break;
				case 'signOut':
					this.handleStateChange('signIn', null);
					break;
				case 'customGreetingSignOut':
					this.handleStateChange('signIn', null);
					break;
				default:
					break;
			}
		}
	};
	Authenticator.prototype.handleStateChange = function(state, data) {
		logger.debug('authenticator state change ' + state, data);
		if (state === this.state.authState) {
			return;
		}
		if (state === 'signedOut') {
			state = 'signIn';
		}
		try {
			localStorage.setItem(AUTHENTICATOR_AUTHSTATE, state);
		} catch (e) {
			logger.debug('Failed to set the auth state into local storage', e);
		}
		if (this._isMounted) {
			this.setState({
				authState: state,
				authData: data,
				error: null,
				showToast: false,
			});
		}
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}
	};
	Authenticator.prototype.handleAuthEvent = function(state, event, showToast) {
		if (showToast === void 0) {
			showToast = true;
		}
		if (event.type === 'error') {
			var map = this.props.errorMessage || AmplifyMessageMap;
			var message = typeof map === 'string' ? map : map(event.data);
			this.setState({ error: message, showToast: showToast });
		}
	};
	Authenticator.prototype.render = function() {
		var _this = this;
		var _a = this.state,
			authState = _a.authState,
			authData = _a.authData;
		var theme = this.props.theme || AmplifyTheme;
		var messageMap = this.props.errorMessage || AmplifyMessageMap;
		// If container prop is undefined, default to AWS Amplify UI Container
		// otherwise if truthy, use the supplied render prop
		// otherwise if falsey, use EmptyContainer
		var Wrapper =
			this.props.container === undefined
				? Container
				: this.props.container || EmptyContainer;
		var _b = this.props,
			hideDefault = _b.hideDefault,
			_c = _b.hide,
			hide = _c === void 0 ? [] : _c,
			federated = _b.federated,
			signUpConfig = _b.signUpConfig,
			usernameAttributes = _b.usernameAttributes;
		if (hideDefault) {
			hide = hide.concat([
				Greetings,
				SignIn,
				ConfirmSignIn,
				RequireNewPassword,
				SignUp,
				ConfirmSignUp,
				VerifyContact,
				ForgotPassword,
				TOTPSetup,
				Loading,
			]);
		}
		var props_children = [];
		if (typeof this.props.children === 'object') {
			if (Array.isArray(this.props.children)) {
				props_children = this.props.children;
			} else {
				props_children.push(this.props.children);
			}
		}
		var default_children = [
			React.createElement(Greetings, { federated: federated }),
			React.createElement(SignIn, { federated: federated }),
			React.createElement(ConfirmSignIn, null),
			React.createElement(RequireNewPassword, null),
			React.createElement(SignUp, { signUpConfig: signUpConfig }),
			React.createElement(ConfirmSignUp, null),
			React.createElement(VerifyContact, null),
			React.createElement(ForgotPassword, null),
			React.createElement(TOTPSetup, null),
			React.createElement(Loading, null),
		];
		var props_children_override = React.Children.map(props_children, function(
			child
		) {
			return child.props.override;
		});
		hide = hide.filter(function(component) {
			return !props_children.find(function(child) {
				return child.type === component;
			});
		});
		var render_props_children = React.Children.map(props_children, function(
			child,
			index
		) {
			return React.cloneElement(child, {
				key: 'aws-amplify-authenticator-props-children-' + index,
				theme: theme,
				messageMap: messageMap,
				authState: authState,
				authData: authData,
				onStateChange: _this.handleStateChange,
				onAuthEvent: _this.handleAuthEvent,
				hide: hide,
				override: props_children_override,
				usernameAttributes: usernameAttributes,
			});
		});
		var render_default_children = hideDefault
			? []
			: React.Children.map(default_children, function(child, index) {
					return React.cloneElement(child, {
						key: 'aws-amplify-authenticator-default-children-' + index,
						theme: theme,
						messageMap: messageMap,
						authState: authState,
						authData: authData,
						onStateChange: _this.handleStateChange,
						onAuthEvent: _this.handleAuthEvent,
						hide: hide,
						override: props_children_override,
						usernameAttributes: usernameAttributes,
					});
			  });
		var render_children = render_default_children.concat(render_props_children);
		var error = this.state.error;
		return React.createElement(
			Wrapper,
			{ theme: theme },
			this.state.showToast &&
				React.createElement(
					Toast,
					{
						theme: theme,
						onClose: function() {
							return _this.setState({ showToast: false });
						},
						'data-test': auth.signIn.signInError,
					},
					I18n.get(error)
				),
			render_children
		);
	};
	return Authenticator;
})(React.Component);
export default Authenticator;
//# sourceMappingURL=Authenticator.js.map
