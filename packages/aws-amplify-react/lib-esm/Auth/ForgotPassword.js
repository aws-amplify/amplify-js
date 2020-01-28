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
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	InputLabel,
	Button,
	FormField,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
var logger = new Logger('ForgotPassword');
var ForgotPassword = /** @class */ (function(_super) {
	__extends(ForgotPassword, _super);
	function ForgotPassword(props) {
		var _this = _super.call(this, props) || this;
		_this.send = _this.send.bind(_this);
		_this.submit = _this.submit.bind(_this);
		_this._validAuthStates = ['forgotPassword'];
		_this.state = { delivery: null };
		return _this;
	}
	ForgotPassword.prototype.send = function() {
		var _this = this;
		var _a = this.props.authData,
			authData = _a === void 0 ? {} : _a;
		var username = this.getUsernameFromInput() || authData.username;
		if (!Auth || typeof Auth.forgotPassword !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.forgotPassword(username)
			.then(function(data) {
				logger.debug(data);
				_this.setState({ delivery: data.CodeDeliveryDetails });
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	ForgotPassword.prototype.submit = function() {
		var _this = this;
		var _a = this.props.authData,
			authData = _a === void 0 ? {} : _a;
		var _b = this.inputs,
			code = _b.code,
			password = _b.password;
		var username = this.getUsernameFromInput() || authData.username;
		if (!Auth || typeof Auth.forgotPasswordSubmit !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.forgotPasswordSubmit(username, code, password)
			.then(function(data) {
				logger.debug(data);
				_this.changeState('signIn');
				_this.setState({ delivery: null });
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	ForgotPassword.prototype.sendView = function() {
		var theme = this.props.theme || AmplifyTheme;
		return React.createElement('div', null, this.renderUsernameField(theme));
	};
	ForgotPassword.prototype.submitView = function() {
		var theme = this.props.theme || AmplifyTheme;
		return React.createElement(
			'div',
			null,
			React.createElement(
				FormField,
				{ theme: theme },
				React.createElement(
					InputLabel,
					{ theme: theme },
					I18n.get('Code'),
					' *'
				),
				React.createElement(Input, {
					placeholder: I18n.get('Code'),
					theme: theme,
					key: 'code',
					name: 'code',
					autoComplete: 'off',
					onChange: this.handleInputChange,
				})
			),
			React.createElement(
				FormField,
				{ theme: theme },
				React.createElement(
					InputLabel,
					{ theme: theme },
					I18n.get('New Password'),
					' *'
				),
				React.createElement(Input, {
					placeholder: I18n.get('New Password'),
					theme: theme,
					type: 'password',
					key: 'password',
					name: 'password',
					autoComplete: 'off',
					onChange: this.handleInputChange,
				})
			)
		);
	};
	ForgotPassword.prototype.showComponent = function(theme) {
		var _this = this;
		var _a = this.props,
			authState = _a.authState,
			hide = _a.hide,
			_b = _a.authData,
			authData = _b === void 0 ? {} : _b;
		if (hide && hide.includes(ForgotPassword)) {
			return null;
		}
		return React.createElement(
			FormSection,
			{ theme: theme, 'data-test': auth.forgotPassword.section },
			React.createElement(
				SectionHeader,
				{ theme: theme, 'data-test': auth.forgotPassword.headerSection },
				I18n.get('Reset your password')
			),
			React.createElement(
				SectionBody,
				{ theme: theme, 'data-test': auth.forgotPassword.bodySection },
				this.state.delivery || authData.username
					? this.submitView()
					: this.sendView()
			),
			React.createElement(
				SectionFooter,
				{ theme: theme },
				React.createElement(
					SectionFooterPrimaryContent,
					{ theme: theme },
					this.state.delivery || authData.username
						? React.createElement(
								Button,
								{
									theme: theme,
									onClick: this.submit,
									'data-test': auth.forgotPassword.submitButton,
								},
								I18n.get('Submit')
						  )
						: React.createElement(
								Button,
								{
									theme: theme,
									onClick: this.send,
									'data-test': auth.forgotPassword.sendCodeButton,
								},
								I18n.get('Send Code')
						  )
				),
				React.createElement(
					SectionFooterSecondaryContent,
					{ theme: theme },
					this.state.delivery || authData.username
						? React.createElement(
								Link,
								{
									theme: theme,
									onClick: this.send,
									'data-test': auth.forgotPassword.resendCodeLink,
								},
								I18n.get('Resend Code')
						  )
						: React.createElement(
								Link,
								{
									theme: theme,
									onClick: function() {
										return _this.changeState('signIn');
									},
									'data-test': auth.forgotPassword.backToSignInLink,
								},
								I18n.get('Back to Sign In')
						  )
				)
			)
		);
	};
	return ForgotPassword;
})(AuthPiece);
export default ForgotPassword;
//# sourceMappingURL=ForgotPassword.js.map
