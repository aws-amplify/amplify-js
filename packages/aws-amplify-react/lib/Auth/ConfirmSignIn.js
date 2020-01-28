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
var ConfirmSignIn = /** @class */ (function(_super) {
	__extends(ConfirmSignIn, _super);
	function ConfirmSignIn(props) {
		var _this = _super.call(this, props) || this;
		_this._validAuthStates = ['confirmSignIn'];
		_this.confirm = _this.confirm.bind(_this);
		_this.checkContact = _this.checkContact.bind(_this);
		_this.state = {
			mfaType: 'SMS',
		};
		return _this;
	}
	ConfirmSignIn.prototype.checkContact = function(user) {
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
				var newUser = Object.assign(user, data);
				_this.changeState('verifyContact', newUser);
			}
		});
	};
	ConfirmSignIn.prototype.confirm = function(event) {
		var _this = this;
		if (event) {
			event.preventDefault();
		}
		var user = this.props.authData;
		var code = this.inputs.code;
		var mfaType =
			user.challengeName === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : null;
		if (!auth_1.default || typeof auth_1.default.confirmSignIn !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.confirmSignIn(user, code, mfaType)
			.then(function() {
				_this.checkContact(user);
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	ConfirmSignIn.prototype.componentDidUpdate = function() {
		// logger.debug('component did update with props', this.props);
		var user = this.props.authData;
		var mfaType =
			user && user.challengeName === 'SOFTWARE_TOKEN_MFA' ? 'TOTP' : 'SMS';
		if (this.state.mfaType !== mfaType) this.setState({ mfaType: mfaType });
	};
	ConfirmSignIn.prototype.showComponent = function(theme) {
		var _this = this;
		var hide = this.props.hide;
		if (hide && hide.includes(ConfirmSignIn)) {
			return null;
		}
		return React.createElement(
			Amplify_UI_Components_React_1.FormSection,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.confirmSignIn.section,
			},
			React.createElement(
				Amplify_UI_Components_React_1.SectionHeader,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.confirmSignIn.headerSection,
				},
				core_1.I18n.get('Confirm ' + this.state.mfaType + ' Code')
			),
			React.createElement(
				'form',
				{
					onSubmit: this.confirm,
					'data-test': data_test_attributes_1.auth.confirmSignIn.bodySection,
				},
				React.createElement(
					Amplify_UI_Components_React_1.SectionBody,
					{ theme: theme },
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
							autoFocus: true,
							placeholder: core_1.I18n.get('Code'),
							theme: theme,
							key: 'code',
							name: 'code',
							autoComplete: 'off',
							onChange: this.handleInputChange,
							'data-test': data_test_attributes_1.auth.confirmSignIn.codeInput,
						})
					)
				),
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooter,
					{ theme: theme },
					React.createElement(
						Amplify_UI_Components_React_1.SectionFooterPrimaryContent,
						{
							theme: theme,
							'data-test':
								data_test_attributes_1.auth.confirmSignIn.confirmButton,
						},
						React.createElement(
							Amplify_UI_Components_React_1.Button,
							{ theme: theme, type: 'submit' },
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
									data_test_attributes_1.auth.confirmSignIn.backToSignInLink,
							},
							core_1.I18n.get('Back to Sign In')
						)
					)
				)
			)
		);
	};
	return ConfirmSignIn;
})(AuthPiece_1.default);
exports.default = ConfirmSignIn;
//# sourceMappingURL=ConfirmSignIn.js.map
