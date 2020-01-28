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
var logger = new core_1.ConsoleLogger('RequireNewPassword');
var RequireNewPassword = /** @class */ (function(_super) {
	__extends(RequireNewPassword, _super);
	function RequireNewPassword(props) {
		var _this = _super.call(this, props) || this;
		_this._validAuthStates = ['requireNewPassword'];
		_this.change = _this.change.bind(_this);
		_this.checkContact = _this.checkContact.bind(_this);
		return _this;
	}
	RequireNewPassword.prototype.checkContact = function(user) {
		var _this = this;
		if (
			!auth_1.default ||
			typeof auth_1.default.verifiedContact !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default.verifiedContact(user).then(function(data) {
			if (!core_1.JS.isEmpty(data.verified)) {
				_this.changeState('signedIn', user);
			} else {
				user = Object.assign(user, data);
				_this.changeState('verifyContact', user);
			}
		});
	};
	RequireNewPassword.prototype.change = function() {
		var _this = this;
		var user = this.props.authData;
		var password = this.inputs.password;
		var requiredAttributes = user.challengeParam.requiredAttributes;
		var attrs = objectWithProperties(this.inputs, requiredAttributes);
		if (
			!auth_1.default ||
			typeof auth_1.default.completeNewPassword !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.completeNewPassword(user, password, attrs)
			.then(function(user) {
				logger.debug('complete new password', user);
				if (user.challengeName === 'SMS_MFA') {
					_this.changeState('confirmSignIn', user);
				} else if (user.challengeName === 'MFA_SETUP') {
					logger.debug('TOTP setup', user.challengeParam);
					_this.changeState('TOTPSetup', user);
				} else {
					_this.checkContact(user);
				}
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	RequireNewPassword.prototype.showComponent = function(theme) {
		var _this = this;
		var hide = this.props.hide;
		if (hide && hide.includes(RequireNewPassword)) {
			return null;
		}
		var user = this.props.authData;
		var requiredAttributes = user.challengeParam.requiredAttributes;
		return React.createElement(
			Amplify_UI_Components_React_1.FormSection,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.requireNewPassword.section,
			},
			React.createElement(
				Amplify_UI_Components_React_1.SectionHeader,
				{
					theme: theme,
					'data-test':
						data_test_attributes_1.auth.requireNewPassword.headerSection,
				},
				core_1.I18n.get('Change Password')
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionBody,
				{
					theme: theme,
					'data-test':
						data_test_attributes_1.auth.requireNewPassword.bodySection,
				},
				React.createElement(Amplify_UI_Components_React_1.Input, {
					autoFocus: true,
					placeholder: core_1.I18n.get('New Password'),
					theme: theme,
					key: 'password',
					name: 'password',
					type: 'password',
					onChange: this.handleInputChange,
					'data-test':
						data_test_attributes_1.auth.requireNewPassword.newPasswordInput,
				}),
				requiredAttributes.map(function(attribute) {
					return React.createElement(Amplify_UI_Components_React_1.Input, {
						placeholder: core_1.I18n.get(convertToPlaceholder(attribute)),
						theme: theme,
						key: attribute,
						name: attribute,
						type: 'text',
						onChange: _this.handleInputChange,
					});
				})
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionFooter,
				{ theme: theme },
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooterPrimaryContent,
					{ theme: theme },
					React.createElement(
						Amplify_UI_Components_React_1.Button,
						{ theme: theme, onClick: this.change },
						core_1.I18n.get('Change')
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
								data_test_attributes_1.auth.requireNewPassword.backToSignInLink,
						},
						core_1.I18n.get('Back to Sign In')
					)
				)
			)
		);
	};
	return RequireNewPassword;
})(AuthPiece_1.default);
exports.default = RequireNewPassword;
function convertToPlaceholder(str) {
	return str
		.split('_')
		.map(function(part) {
			return part.charAt(0).toUpperCase() + part.substr(1).toLowerCase();
		})
		.join(' ');
}
function objectWithProperties(obj, keys) {
	var target = {};
	for (var key in obj) {
		if (keys.indexOf(key) === -1) {
			continue;
		}
		if (!Object.prototype.hasOwnProperty.call(obj, key)) {
			continue;
		}
		target[key] = obj[key];
	}
	return target;
}
//# sourceMappingURL=RequireNewPassword.js.map
