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
var Amplify_UI_Theme_1 = require('../Amplify-UI/Amplify-UI-Theme');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var logger = new core_1.ConsoleLogger('ForgotPassword');
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
		if (
			!auth_1.default ||
			typeof auth_1.default.forgotPassword !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.forgotPassword(username)
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
		if (
			!auth_1.default ||
			typeof auth_1.default.forgotPasswordSubmit !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.forgotPasswordSubmit(username, code, password)
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
		var theme = this.props.theme || Amplify_UI_Theme_1.default;
		return React.createElement('div', null, this.renderUsernameField(theme));
	};
	ForgotPassword.prototype.submitView = function() {
		var theme = this.props.theme || Amplify_UI_Theme_1.default;
		return React.createElement(
			'div',
			null,
			React.createElement(
				Amplify_UI_Components_React_1.FormField,
				{ theme: theme },
				React.createElement(
					Amplify_UI_Components_React_1.InputLabel,
					{ theme: theme },
					core_1.I18n.get('Code'),
					' *'
				),
				React.createElement(Amplify_UI_Components_React_1.Input, {
					placeholder: core_1.I18n.get('Code'),
					theme: theme,
					key: 'code',
					name: 'code',
					autoComplete: 'off',
					onChange: this.handleInputChange,
				})
			),
			React.createElement(
				Amplify_UI_Components_React_1.FormField,
				{ theme: theme },
				React.createElement(
					Amplify_UI_Components_React_1.InputLabel,
					{ theme: theme },
					core_1.I18n.get('New Password'),
					' *'
				),
				React.createElement(Amplify_UI_Components_React_1.Input, {
					placeholder: core_1.I18n.get('New Password'),
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
			Amplify_UI_Components_React_1.FormSection,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.forgotPassword.section,
			},
			React.createElement(
				Amplify_UI_Components_React_1.SectionHeader,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.forgotPassword.headerSection,
				},
				core_1.I18n.get('Reset your password')
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionBody,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.forgotPassword.bodySection,
				},
				this.state.delivery || authData.username
					? this.submitView()
					: this.sendView()
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionFooter,
				{ theme: theme },
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooterPrimaryContent,
					{ theme: theme },
					this.state.delivery || authData.username
						? React.createElement(
								Amplify_UI_Components_React_1.Button,
								{
									theme: theme,
									onClick: this.submit,
									'data-test':
										data_test_attributes_1.auth.forgotPassword.submitButton,
								},
								core_1.I18n.get('Submit')
						  )
						: React.createElement(
								Amplify_UI_Components_React_1.Button,
								{
									theme: theme,
									onClick: this.send,
									'data-test':
										data_test_attributes_1.auth.forgotPassword.sendCodeButton,
								},
								core_1.I18n.get('Send Code')
						  )
				),
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooterSecondaryContent,
					{ theme: theme },
					this.state.delivery || authData.username
						? React.createElement(
								Amplify_UI_Components_React_1.Link,
								{
									theme: theme,
									onClick: this.send,
									'data-test':
										data_test_attributes_1.auth.forgotPassword.resendCodeLink,
								},
								core_1.I18n.get('Resend Code')
						  )
						: React.createElement(
								Amplify_UI_Components_React_1.Link,
								{
									theme: theme,
									onClick: function() {
										return _this.changeState('signIn');
									},
									'data-test':
										data_test_attributes_1.auth.forgotPassword.backToSignInLink,
								},
								core_1.I18n.get('Back to Sign In')
						  )
				)
			)
		);
	};
	return ForgotPassword;
})(AuthPiece_1.default);
exports.default = ForgotPassword;
//# sourceMappingURL=ForgotPassword.js.map
