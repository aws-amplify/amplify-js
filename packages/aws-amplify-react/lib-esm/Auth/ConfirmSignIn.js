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
import { I18n, JS } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import {
	FormSection,
	FormField,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	InputLabel,
	Button,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
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
		if (!Auth || typeof Auth.verifiedContact !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifiedContact(user).then(function(data) {
			if (!JS.isEmpty(data.verified)) {
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
		if (!Auth || typeof Auth.confirmSignIn !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.confirmSignIn(user, code, mfaType)
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
			FormSection,
			{ theme: theme, 'data-test': auth.confirmSignIn.section },
			React.createElement(
				SectionHeader,
				{ theme: theme, 'data-test': auth.confirmSignIn.headerSection },
				I18n.get('Confirm ' + this.state.mfaType + ' Code')
			),
			React.createElement(
				'form',
				{ onSubmit: this.confirm, 'data-test': auth.confirmSignIn.bodySection },
				React.createElement(
					SectionBody,
					{ theme: theme },
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
							autoFocus: true,
							placeholder: I18n.get('Code'),
							theme: theme,
							key: 'code',
							name: 'code',
							autoComplete: 'off',
							onChange: this.handleInputChange,
							'data-test': auth.confirmSignIn.codeInput,
						})
					)
				),
				React.createElement(
					SectionFooter,
					{ theme: theme },
					React.createElement(
						SectionFooterPrimaryContent,
						{ theme: theme, 'data-test': auth.confirmSignIn.confirmButton },
						React.createElement(
							Button,
							{ theme: theme, type: 'submit' },
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
								'data-test': auth.confirmSignIn.backToSignInLink,
							},
							I18n.get('Back to Sign In')
						)
					)
				)
			)
		);
	};
	return ConfirmSignIn;
})(AuthPiece);
export default ConfirmSignIn;
//# sourceMappingURL=ConfirmSignIn.js.map
