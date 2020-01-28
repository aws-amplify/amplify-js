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
var AmplifyTheme_1 = require('../AmplifyTheme');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var logger = new core_1.ConsoleLogger('VerifyContact');
var VerifyContact = /** @class */ (function(_super) {
	__extends(VerifyContact, _super);
	function VerifyContact(props) {
		var _this = _super.call(this, props) || this;
		_this._validAuthStates = ['verifyContact'];
		_this.verify = _this.verify.bind(_this);
		_this.submit = _this.submit.bind(_this);
		_this.state = { verifyAttr: null };
		return _this;
	}
	VerifyContact.prototype.verify = function() {
		var _this = this;
		var _a = this.inputs,
			contact = _a.contact,
			checkedValue = _a.checkedValue;
		if (!contact) {
			this.error('Neither Email nor Phone Number selected');
			return;
		}
		if (
			!auth_1.default ||
			typeof auth_1.default.verifyCurrentUserAttribute !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.verifyCurrentUserAttribute(checkedValue)
			.then(function(data) {
				logger.debug(data);
				_this.setState({ verifyAttr: checkedValue });
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	VerifyContact.prototype.submit = function() {
		var _this = this;
		var attr = this.state.verifyAttr;
		var code = this.inputs.code;
		if (
			!auth_1.default ||
			typeof auth_1.default.verifyCurrentUserAttributeSubmit !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default
			.verifyCurrentUserAttributeSubmit(attr, code)
			.then(function(data) {
				logger.debug(data);
				_this.changeState('signedIn', _this.props.authData);
				_this.setState({ verifyAttr: null });
			})
			.catch(function(err) {
				return _this.error(err);
			});
	};
	VerifyContact.prototype.verifyView = function() {
		var user = this.props.authData;
		if (!user) {
			logger.debug('no user for verify');
			return null;
		}
		var unverified = user.unverified;
		if (!unverified) {
			logger.debug('no unverified on user');
			return null;
		}
		var email = unverified.email,
			phone_number = unverified.phone_number;
		var theme = this.props.theme || AmplifyTheme_1.default;
		return React.createElement(
			'div',
			null,
			email
				? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
						placeholder: core_1.I18n.get('Email'),
						theme: theme,
						key: 'email',
						name: 'contact',
						value: 'email',
						onChange: this.handleInputChange,
				  })
				: null,
			phone_number
				? React.createElement(Amplify_UI_Components_React_1.RadioRow, {
						placeholder: core_1.I18n.get('Phone Number'),
						theme: theme,
						key: 'phone_number',
						name: 'contact',
						value: 'phone_number',
						onChange: this.handleInputChange,
				  })
				: null
		);
	};
	VerifyContact.prototype.submitView = function() {
		var theme = this.props.theme || AmplifyTheme_1.default;
		return React.createElement(
			'div',
			null,
			React.createElement(Amplify_UI_Components_React_1.Input, {
				placeholder: core_1.I18n.get('Code'),
				theme: theme,
				key: 'code',
				name: 'code',
				autoComplete: 'off',
				onChange: this.handleInputChange,
			})
		);
	};
	VerifyContact.prototype.showComponent = function(theme) {
		var _this = this;
		var _a = this.props,
			authData = _a.authData,
			hide = _a.hide;
		if (hide && hide.includes(VerifyContact)) {
			return null;
		}
		return React.createElement(
			Amplify_UI_Components_React_1.FormSection,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.verifyContact.section,
			},
			React.createElement(
				Amplify_UI_Components_React_1.SectionHeader,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.verifyContact.headerSection,
				},
				core_1.I18n.get(
					'Account recovery requires verified contact information'
				)
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionBody,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.verifyContact.bodySection,
				},
				this.state.verifyAttr ? this.submitView() : this.verifyView()
			),
			React.createElement(
				Amplify_UI_Components_React_1.SectionFooter,
				{ theme: theme },
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooterPrimaryContent,
					{ theme: theme },
					this.state.verifyAttr
						? React.createElement(
								Amplify_UI_Components_React_1.Button,
								{
									theme: theme,
									onClick: this.submit,
									'data-test':
										data_test_attributes_1.auth.verifyContact.submitButton,
								},
								core_1.I18n.get('Submit')
						  )
						: React.createElement(
								Amplify_UI_Components_React_1.Button,
								{
									theme: theme,
									onClick: this.verify,
									'data-test':
										data_test_attributes_1.auth.verifyContact.verifyButton,
								},
								core_1.I18n.get('Verify')
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
								return _this.changeState('signedIn', authData);
							},
							'data-test': data_test_attributes_1.auth.verifyContact.skipLink,
						},
						core_1.I18n.get('Skip')
					)
				)
			)
		);
	};
	return VerifyContact;
})(AuthPiece_1.default);
exports.default = VerifyContact;
//# sourceMappingURL=VerifyContact.js.map
