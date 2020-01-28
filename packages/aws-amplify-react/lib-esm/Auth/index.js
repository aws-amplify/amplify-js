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
import Authenticator from './Authenticator';
export { default as Authenticator } from './Authenticator';
export { default as AuthPiece } from './AuthPiece';
export { default as SignIn } from './SignIn';
export { default as ConfirmSignIn } from './ConfirmSignIn';
export { default as SignOut } from './SignOut';
export { default as RequireNewPassword } from './RequireNewPassword';
export { default as SignUp } from './SignUp';
export { default as ConfirmSignUp } from './ConfirmSignUp';
export { default as VerifyContact } from './VerifyContact';
export { default as ForgotPassword } from './ForgotPassword';
export { default as Greetings } from './Greetings';
export {
	default as FederatedSignIn,
	FederatedButtons,
} from './FederatedSignIn';
export { default as TOTPSetup } from './TOTPSetup';
export { default as Loading } from './Loading';
export * from './Provider';
export function withAuthenticator(
	Comp,
	includeGreetings,
	authenticatorComponents,
	federated,
	theme,
	signUpConfig
) {
	if (includeGreetings === void 0) {
		includeGreetings = false;
	}
	if (authenticatorComponents === void 0) {
		authenticatorComponents = [];
	}
	if (federated === void 0) {
		federated = null;
	}
	if (theme === void 0) {
		theme = null;
	}
	if (signUpConfig === void 0) {
		signUpConfig = {};
	}
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1(props) {
			var _this = _super.call(this, props) || this;
			_this.handleAuthStateChange = _this.handleAuthStateChange.bind(_this);
			_this.state = {
				authState: props.authState || null,
				authData: props.authData || null,
			};
			_this.authConfig = {};
			if (typeof includeGreetings === 'object' && includeGreetings !== null) {
				_this.authConfig = Object.assign(_this.authConfig, includeGreetings);
			} else {
				_this.authConfig = {
					includeGreetings: includeGreetings,
					authenticatorComponents: authenticatorComponents,
					federated: federated,
					theme: theme,
					signUpConfig: signUpConfig,
				};
			}
			return _this;
		}
		class_1.prototype.handleAuthStateChange = function(state, data) {
			this.setState({ authState: state, authData: data });
		};
		class_1.prototype.render = function() {
			var _a = this.state,
				authState = _a.authState,
				authData = _a.authData;
			var signedIn = authState === 'signedIn';
			if (signedIn) {
				return React.createElement(
					React.Fragment,
					null,
					this.authConfig.includeGreetings
						? React.createElement(
								Authenticator,
								__assign({}, this.props, {
									theme: this.authConfig.theme,
									federated: this.authConfig.federated || this.props.federated,
									hideDefault:
										this.authConfig.authenticatorComponents &&
										this.authConfig.authenticatorComponents.length > 0,
									signUpConfig: this.authConfig.signUpConfig,
									usernameAttributes: this.authConfig.usernameAttributes,
									onStateChange: this.handleAuthStateChange,
									children: this.authConfig.authenticatorComponents || [],
								})
						  )
						: null,
					React.createElement(
						Comp,
						__assign({}, this.props, {
							authState: authState,
							authData: authData,
							onStateChange: this.handleAuthStateChange,
						})
					)
				);
			}
			return React.createElement(
				Authenticator,
				__assign({}, this.props, {
					theme: this.authConfig.theme,
					federated: this.authConfig.federated || this.props.federated,
					hideDefault:
						this.authConfig.authenticatorComponents &&
						this.authConfig.authenticatorComponents.length > 0,
					signUpConfig: this.authConfig.signUpConfig,
					usernameAttributes: this.authConfig.usernameAttributes,
					onStateChange: this.handleAuthStateChange,
					children: this.authConfig.authenticatorComponents || [],
				})
			);
		};
		return class_1;
	})(React.Component);
}
var AuthenticatorWrapper = /** @class */ (function(_super) {
	__extends(AuthenticatorWrapper, _super);
	function AuthenticatorWrapper(props) {
		var _this = _super.call(this, props) || this;
		_this.state = { auth: 'init' };
		_this.handleAuthState = _this.handleAuthState.bind(_this);
		_this.renderChildren = _this.renderChildren.bind(_this);
		return _this;
	}
	AuthenticatorWrapper.prototype.handleAuthState = function(state, data) {
		this.setState({ auth: state, authData: data });
	};
	AuthenticatorWrapper.prototype.renderChildren = function() {
		// @ts-ignore
		return this.props.children(this.state.auth);
	};
	AuthenticatorWrapper.prototype.render = function() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				Authenticator,
				__assign({}, this.props, { onStateChange: this.handleAuthState })
			),
			this.renderChildren()
		);
	};
	return AuthenticatorWrapper;
})(React.Component);
export { AuthenticatorWrapper };
//# sourceMappingURL=index.js.map
