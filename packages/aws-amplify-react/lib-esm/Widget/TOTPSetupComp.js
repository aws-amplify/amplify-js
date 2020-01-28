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
import { Component } from 'react';
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	InputLabel,
	Input,
	Button,
	Toast,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { totpQrcode } from '@aws-amplify/ui';
var QRCode = require('qrcode.react');
var logger = new Logger('TOTPSetupComp');
var TOTPSetupComp = /** @class */ (function(_super) {
	__extends(TOTPSetupComp, _super);
	function TOTPSetupComp(props) {
		var _this = _super.call(this, props) || this;
		_this.setup = _this.setup.bind(_this);
		_this.showSecretCode = _this.showSecretCode.bind(_this);
		_this.verifyTotpToken = _this.verifyTotpToken.bind(_this);
		_this.handleInputChange = _this.handleInputChange.bind(_this);
		_this.triggerTOTPEvent = _this.triggerTOTPEvent.bind(_this);
		_this.state = {
			code: null,
			setupMessage: null,
		};
		return _this;
	}
	TOTPSetupComp.prototype.componentDidMount = function() {
		this.setup();
	};
	TOTPSetupComp.prototype.triggerTOTPEvent = function(event, data, user) {
		if (this.props.onTOTPEvent) {
			this.props.onTOTPEvent(event, data, user);
		}
	};
	TOTPSetupComp.prototype.handleInputChange = function(evt) {
		this.setState({ setupMessage: null });
		this.inputs = {};
		var _a = evt.target,
			name = _a.name,
			value = _a.value,
			type = _a.type,
			checked = _a.checked;
		// @ts-ignore
		var check_type = ['radio', 'checkbox'].includes(type);
		this.inputs[name] = check_type ? checked : value;
	};
	TOTPSetupComp.prototype.setup = function() {
		var _this = this;
		this.setState({ setupMessage: null });
		var user = this.props.authData;
		var issuer = encodeURI(I18n.get('AWSCognito'));
		if (!Auth || typeof Auth.setupTOTP !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.setupTOTP(user)
			.then(function(data) {
				logger.debug('secret key', data);
				var code =
					'otpauth://totp/' +
					issuer +
					':' +
					user.username +
					'?secret=' +
					data +
					'&issuer=' +
					issuer;
				_this.setState({ code: code });
			})
			.catch(function(err) {
				return logger.debug('totp setup failed', err);
			});
	};
	TOTPSetupComp.prototype.verifyTotpToken = function() {
		var _this = this;
		if (!this.inputs) {
			logger.debug('no input');
			return;
		}
		var user = this.props.authData;
		var totpCode = this.inputs.totpCode;
		if (
			!Auth ||
			typeof Auth.verifyTotpToken !== 'function' ||
			typeof Auth.setPreferredMFA !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		return Auth.verifyTotpToken(user, totpCode)
			.then(function() {
				// set it to preferred mfa
				return Auth.setPreferredMFA(user, 'TOTP')
					.then(function() {
						_this.setState({ setupMessage: 'Setup TOTP successfully!' });
						logger.debug('set up totp success!');
						_this.triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
					})
					.catch(function(err) {
						_this.setState({ setupMessage: 'Setup TOTP failed!' });
						logger.error(err);
					});
			})
			.catch(function(err) {
				_this.setState({ setupMessage: 'Setup TOTP failed!' });
				logger.error(err);
			});
	};
	TOTPSetupComp.prototype.showSecretCode = function(code, theme) {
		if (!code) return null;
		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: totpQrcode },
				React.createElement(QRCode, { value: code })
			),
			React.createElement(
				InputLabel,
				{ theme: theme },
				I18n.get('Enter Security Code:')
			),
			React.createElement(Input, {
				autoFocus: true,
				theme: theme,
				key: 'totpCode',
				name: 'totpCode',
				onChange: this.handleInputChange,
			})
		);
	};
	TOTPSetupComp.prototype.render = function() {
		var theme = this.props.theme ? this.props.theme : AmplifyTheme;
		var code = this.state.code;
		return React.createElement(
			FormSection,
			{ theme: theme },
			this.state.setupMessage &&
				React.createElement(Toast, null, I18n.get(this.state.setupMessage)),
			React.createElement(
				SectionHeader,
				{ theme: theme },
				I18n.get('Scan then enter verification code')
			),
			React.createElement(
				SectionBody,
				{ theme: theme },
				this.showSecretCode(code, theme),
				this.state.setupMessage && I18n.get(this.state.setupMessage)
			),
			React.createElement(
				SectionFooter,
				{ theme: theme },
				React.createElement(
					Button,
					{
						theme: theme,
						onClick: this.verifyTotpToken,
						style: { width: '100%' },
					},
					I18n.get('Verify Security Token')
				)
			)
		);
	};
	return TOTPSetupComp;
})(Component);
export default TOTPSetupComp;
//# sourceMappingURL=TOTPSetupComp.js.map
