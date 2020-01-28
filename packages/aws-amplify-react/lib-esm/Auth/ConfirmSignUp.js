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
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Button,
	Link,
	InputLabel,
	Input,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
	FormField,
	Hint,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
var logger = new Logger('ConfirmSignUp');
var ConfirmSignUp = /** @class */ (function(_super) {
	__extends(ConfirmSignUp, _super);
	function ConfirmSignUp(props) {
		var _this = _super.call(this, props) || this;
		_this._validAuthStates = ['confirmSignUp'];
		_this.confirm = _this.confirm.bind(_this);
		_this.resend = _this.resend.bind(_this);
		return _this;
	}
	ConfirmSignUp.prototype.confirm = function() {
		var _this = this;
		var username = this.usernameFromAuthData() || this.inputs.username;
		var code = this.inputs.code;
		if (!Auth || typeof Auth.confirmSignUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.confirmSignUp(username, code)
			.then(function() {
				return _this.changeState('signedUp');
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	ConfirmSignUp.prototype.resend = function() {
		var _this = this;
		var username = this.usernameFromAuthData() || this.inputs.username;
		if (!Auth || typeof Auth.resendSignUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.resendSignUp(username)
			.then(function() {
				return logger.debug('code resent');
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	ConfirmSignUp.prototype.showComponent = function(theme) {
		var _this = this;
		var hide = this.props.hide;
		var username = this.usernameFromAuthData();
		if (hide && hide.includes(ConfirmSignUp)) {
			return null;
		}
		return React.createElement(
			FormSection,
			{ theme: theme, 'data-test': auth.confirmSignUp.section },
			React.createElement(
				SectionHeader,
				{ theme: theme, 'data-test': auth.confirmSignUp.headerSection },
				I18n.get('Confirm Sign Up')
			),
			React.createElement(
				SectionBody,
				{ theme: theme, 'data-test': auth.confirmSignUp.bodySection },
				React.createElement(
					FormField,
					{ theme: theme },
					React.createElement(
						InputLabel,
						{ theme: theme },
						I18n.get(this.getUsernameLabel()),
						' *'
					),
					React.createElement(Input, {
						placeholder: I18n.get('Username'),
						theme: theme,
						key: 'username',
						name: 'username',
						onChange: this.handleInputChange,
						disabled: username,
						value: username ? username : '',
						'data-test': auth.confirmSignUp.usernameInput,
					})
				),
				React.createElement(
					FormField,
					{ theme: theme },
					React.createElement(
						InputLabel,
						{ theme: theme },
						I18n.get('Confirmation Code'),
						' *'
					),
					React.createElement(Input, {
						autoFocus: true,
						placeholder: I18n.get('Enter your code'),
						theme: theme,
						key: 'code',
						name: 'code',
						autoComplete: 'off',
						onChange: this.handleInputChange,
						'data-test': auth.confirmSignUp.confirmationCodeInput,
					}),
					React.createElement(
						Hint,
						{ theme: theme },
						I18n.get('Lost your code? '),
						React.createElement(
							Link,
							{
								theme: theme,
								onClick: this.resend,
								'data-test': auth.confirmSignUp.resendCodeLink,
							},
							I18n.get('Resend Code')
						)
					)
				)
			),
			React.createElement(
				SectionFooter,
				{ theme: theme },
				React.createElement(
					SectionFooterPrimaryContent,
					{ theme: theme },
					React.createElement(
						Button,
						{
							theme: theme,
							onClick: this.confirm,
							'data-test': auth.confirmSignUp.confirmButton,
						},
						I18n.get('Confirm')
					)
				),
				React.createElement(
					SectionFooterSecondaryContent,
					{ theme: theme },
					React.createElement(
						Link,
						{
							theme: theme,
							onClick: function() {
								return _this.changeState('signIn');
							},
							'data-test': auth.confirmSignUp.backToSignInLink,
						},
						I18n.get('Back to Sign In')
					)
				)
			)
		);
	};
	return ConfirmSignUp;
})(AuthPiece);
export default ConfirmSignUp;
//# sourceMappingURL=ConfirmSignUp.js.map
