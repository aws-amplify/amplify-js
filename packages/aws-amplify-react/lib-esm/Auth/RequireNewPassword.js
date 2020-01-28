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
import { I18n, JS, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	Button,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
var logger = new Logger('RequireNewPassword');
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
		if (!Auth || typeof Auth.verifiedContact !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifiedContact(user).then(function(data) {
			if (!JS.isEmpty(data.verified)) {
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
		if (!Auth || typeof Auth.completeNewPassword !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.completeNewPassword(user, password, attrs)
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
			FormSection,
			{ theme: theme, 'data-test': auth.requireNewPassword.section },
			React.createElement(
				SectionHeader,
				{ theme: theme, 'data-test': auth.requireNewPassword.headerSection },
				I18n.get('Change Password')
			),
			React.createElement(
				SectionBody,
				{ theme: theme, 'data-test': auth.requireNewPassword.bodySection },
				React.createElement(Input, {
					autoFocus: true,
					placeholder: I18n.get('New Password'),
					theme: theme,
					key: 'password',
					name: 'password',
					type: 'password',
					onChange: this.handleInputChange,
					'data-test': auth.requireNewPassword.newPasswordInput,
				}),
				requiredAttributes.map(function(attribute) {
					return React.createElement(Input, {
						placeholder: I18n.get(convertToPlaceholder(attribute)),
						theme: theme,
						key: attribute,
						name: attribute,
						type: 'text',
						onChange: _this.handleInputChange,
					});
				})
			),
			React.createElement(
				SectionFooter,
				{ theme: theme },
				React.createElement(
					SectionFooterPrimaryContent,
					{ theme: theme },
					React.createElement(
						Button,
						{ theme: theme, onClick: this.change },
						I18n.get('Change')
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
							'data-test': auth.requireNewPassword.backToSignInLink,
						},
						I18n.get('Back to Sign In')
					)
				)
			)
		);
	};
	return RequireNewPassword;
})(AuthPiece);
export default RequireNewPassword;
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
