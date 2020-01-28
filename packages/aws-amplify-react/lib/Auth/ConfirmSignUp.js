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
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var logger = new core_1.ConsoleLogger('ConfirmSignUp');
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
		if (!auth_1.default || typeof auth_1.default.confirmSignUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.confirmSignUp(username, code)
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
		if (!auth_1.default || typeof auth_1.default.resendSignUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.resendSignUp(username)
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
			Amplify_UI_Components_React_1.FormSection,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.confirmSignUp.section,
			},
			React.createElement(
				Amplify_UI_Components_React_1.SectionHeader,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.confirmSignUp.headerSection,
				},
				core_1.I18n.get('Confirm Sign Up')
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionBody,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.confirmSignUp.bodySection,
				},
				React.createElement(
					Amplify_UI_Components_React_1.FormField,
					{ theme: theme },
					React.createElement(
						Amplify_UI_Components_React_1.InputLabel,
						{ theme: theme },
						core_1.I18n.get(this.getUsernameLabel()),
						' *'
					),
					React.createElement(Amplify_UI_Components_React_1.Input, {
						placeholder: core_1.I18n.get('Username'),
						theme: theme,
						key: 'username',
						name: 'username',
						onChange: this.handleInputChange,
						disabled: username,
						value: username ? username : '',
						'data-test':
							data_test_attributes_1.auth.confirmSignUp.usernameInput,
					})
				),
				React.createElement(
					Amplify_UI_Components_React_1.FormField,
					{ theme: theme },
					React.createElement(
						Amplify_UI_Components_React_1.InputLabel,
						{ theme: theme },
						core_1.I18n.get('Confirmation Code'),
						' *'
					),
					React.createElement(Amplify_UI_Components_React_1.Input, {
						autoFocus: true,
						placeholder: core_1.I18n.get('Enter your code'),
						theme: theme,
						key: 'code',
						name: 'code',
						autoComplete: 'off',
						onChange: this.handleInputChange,
						'data-test':
							data_test_attributes_1.auth.confirmSignUp.confirmationCodeInput,
					}),
					React.createElement(
						Amplify_UI_Components_React_1.Hint,
						{ theme: theme },
						core_1.I18n.get('Lost your code? '),
						React.createElement(
							Amplify_UI_Components_React_1.Link,
							{
								theme: theme,
								onClick: this.resend,
								'data-test':
									data_test_attributes_1.auth.confirmSignUp.resendCodeLink,
							},
							core_1.I18n.get('Resend Code')
						)
					)
				)
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionFooter,
				{ theme: theme },
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooterPrimaryContent,
					{ theme: theme },
					React.createElement(
						Amplify_UI_Components_React_1.Button,
						{
							theme: theme,
							onClick: this.confirm,
							'data-test':
								data_test_attributes_1.auth.confirmSignUp.confirmButton,
						},
						core_1.I18n.get('Confirm')
					)
				),
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooterSecondaryContent,
					{ theme: theme },
					React.createElement(
						Amplify_UI_Components_React_1.Link,
						{
							theme: theme,
							onClick: function() {
								return _this.changeState('signIn');
							},
							'data-test':
								data_test_attributes_1.auth.confirmSignUp.backToSignInLink,
						},
						core_1.I18n.get('Back to Sign In')
					)
				)
			)
		);
	};
	return ConfirmSignUp;
})(AuthPiece_1.default);
exports.default = ConfirmSignUp;
//# sourceMappingURL=ConfirmSignUp.js.map
