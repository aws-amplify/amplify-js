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
	FormField,
	Input,
	InputLabel,
	Button,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
import countryDialCodes from './common/country-dial-codes';
import signUpWithUsernameFields, {
	signUpWithEmailFields,
	signUpWithPhoneNumberFields,
} from './common/default-sign-up-fields';
import { UsernameAttributes } from './common/types';
import { PhoneField } from './PhoneField';
var logger = new Logger('SignUp');
var SignUp = /** @class */ (function(_super) {
	__extends(SignUp, _super);
	function SignUp(props) {
		var _this = _super.call(this, props) || this;
		_this.state = { requestPending: false };
		_this._validAuthStates = ['signUp'];
		_this.signUp = _this.signUp.bind(_this);
		_this.sortFields = _this.sortFields.bind(_this);
		_this.getDefaultDialCode = _this.getDefaultDialCode.bind(_this);
		_this.checkCustomSignUpFields = _this.checkCustomSignUpFields.bind(_this);
		_this.needPrefix = _this.needPrefix.bind(_this);
		_this.header =
			_this.props && _this.props.signUpConfig && _this.props.signUpConfig.header
				? _this.props.signUpConfig.header
				: 'Create a new account';
		var _a = (_this.props || {}).usernameAttributes,
			usernameAttributes = _a === void 0 ? UsernameAttributes.USERNAME : _a;
		if (usernameAttributes === UsernameAttributes.EMAIL) {
			_this.defaultSignUpFields = signUpWithEmailFields;
		} else if (usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
			_this.defaultSignUpFields = signUpWithPhoneNumberFields;
		} else {
			_this.defaultSignUpFields = signUpWithUsernameFields;
		}
		return _this;
	}
	SignUp.prototype.validate = function() {
		var _this = this;
		var invalids = [];
		this.signUpFields.map(function(el) {
			if (el.key !== 'phone_number') {
				if (el.required && !_this.inputs[el.key]) {
					el.invalid = true;
					invalids.push(el.label);
				} else {
					el.invalid = false;
				}
			} else {
				if (el.required && !_this.phone_number) {
					el.invalid = true;
					invalids.push(el.label);
				} else {
					el.invalid = false;
				}
			}
		});
		return invalids;
	};
	SignUp.prototype.sortFields = function() {
		var _this = this;
		if (
			this.props.signUpConfig &&
			this.props.signUpConfig.hiddenDefaults &&
			this.props.signUpConfig.hiddenDefaults.length > 0
		) {
			this.defaultSignUpFields = this.defaultSignUpFields.filter(function(d) {
				return !_this.props.signUpConfig.hiddenDefaults.includes(d.key);
			});
		}
		if (this.checkCustomSignUpFields()) {
			if (
				!this.props.signUpConfig ||
				!this.props.signUpConfig.hideAllDefaults
			) {
				// see if fields passed to component should override defaults
				this.defaultSignUpFields.forEach(function(f) {
					var matchKey = _this.signUpFields.findIndex(function(d) {
						return d.key === f.key;
					});
					if (matchKey === -1) {
						_this.signUpFields.push(f);
					}
				});
			}
			/*
            sort fields based on following rules:
            1. Fields with displayOrder are sorted before those without displayOrder
            2. Fields with conflicting displayOrder are sorted alphabetically by key
            3. Fields without displayOrder are sorted alphabetically by key
          */
			this.signUpFields.sort(function(a, b) {
				if (a.displayOrder && b.displayOrder) {
					if (a.displayOrder < b.displayOrder) {
						return -1;
					} else if (a.displayOrder > b.displayOrder) {
						return 1;
					} else {
						if (a.key < b.key) {
							return -1;
						} else {
							return 1;
						}
					}
				} else if (!a.displayOrder && b.displayOrder) {
					return 1;
				} else if (a.displayOrder && !b.displayOrder) {
					return -1;
				} else if (!a.displayOrder && !b.displayOrder) {
					if (a.key < b.key) {
						return -1;
					} else {
						return 1;
					}
				}
			});
		} else {
			this.signUpFields = this.defaultSignUpFields;
		}
	};
	SignUp.prototype.needPrefix = function(key) {
		var field = this.signUpFields.find(function(e) {
			return e.key === key;
		});
		if (key.indexOf('custom:') !== 0) {
			return field.custom;
		} else if (key.indexOf('custom:') === 0 && field.custom === false) {
			logger.warn(
				'Custom prefix prepended to key but custom field flag is set to false; retaining manually entered prefix'
			);
		}
		return null;
	};
	SignUp.prototype.getDefaultDialCode = function() {
		return this.props.signUpConfig &&
			this.props.signUpConfig.defaultCountryCode &&
			countryDialCodes.indexOf(
				'+' + this.props.signUpConfig.defaultCountryCode
			) !== -1
			? '+' + this.props.signUpConfig.defaultCountryCode
			: '+1';
	};
	SignUp.prototype.checkCustomSignUpFields = function() {
		return (
			this.props.signUpConfig &&
			this.props.signUpConfig.signUpFields &&
			this.props.signUpConfig.signUpFields.length > 0
		);
	};
	SignUp.prototype.signUp = function() {
		var _this = this;
		this.setState({ requestPending: true });
		if (!this.inputs.dial_code) {
			this.inputs.dial_code = this.getDefaultDialCode();
		}
		var validation = this.validate();
		if (validation && validation.length > 0) {
			this.setState({ requestPending: false });
			return this.error(
				'The following fields need to be filled out: ' + validation.join(', ')
			);
		}
		if (!Auth || typeof Auth.signUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		var signup_info = {
			username: this.inputs.username,
			password: this.inputs.password,
			attributes: {},
		};
		var inputKeys = Object.keys(this.inputs);
		var inputVals = Object.values(this.inputs);
		inputKeys.forEach(function(key, index) {
			if (
				!['username', 'password', 'checkedValue', 'dial_code'].includes(key)
			) {
				if (
					key !== 'phone_line_number' &&
					key !== 'dial_code' &&
					key !== 'error'
				) {
					var newKey = '' + (_this.needPrefix(key) ? 'custom:' : '') + key;
					signup_info.attributes[newKey] = inputVals[index];
				}
			}
		});
		if (this.phone_number)
			signup_info.attributes['phone_number'] = this.phone_number;
		var labelCheck = false;
		this.signUpFields.forEach(function(field) {
			if (field.label === _this.getUsernameLabel()) {
				logger.debug('Changing the username to the value of ' + field.label);
				signup_info.username =
					signup_info.attributes[field.key] || signup_info.username;
				labelCheck = true;
			}
		});
		if (!labelCheck && !signup_info.username) {
			// if the customer customized the username field in the sign up form
			// He needs to either set the key of that field to 'username'
			// Or make the label of the field the same as the 'usernameAttributes'
			throw new Error(
				"Couldn't find the label: " +
					this.getUsernameLabel() +
					', in sign up fields according to usernameAttributes!'
			);
		}
		Auth.signUp(signup_info)
			.then(function(data) {
				_this.setState({ requestPending: false });
				// @ts-ignore
				_this.changeState('confirmSignUp', data.user.username);
			})
			.catch(function(err) {
				_this.setState({ requestPending: false });
				return _this.error(err);
			});
	};
	SignUp.prototype.showComponent = function(theme) {
		var _this = this;
		var hide = this.props.hide;
		if (hide && hide.includes(SignUp)) {
			return null;
		}
		if (this.checkCustomSignUpFields()) {
			this.signUpFields = this.props.signUpConfig.signUpFields;
		}
		this.sortFields();
		return React.createElement(
			FormSection,
			{ theme: theme, 'data-test': auth.signUp.section },
			React.createElement(
				SectionHeader,
				{ theme: theme, 'data-test': auth.signUp.headerSection },
				I18n.get(this.header)
			),
			React.createElement(
				SectionBody,
				{ theme: theme, 'data-test': auth.signUp.bodySection },
				this.signUpFields.map(function(field) {
					return field.key !== 'phone_number'
						? React.createElement(
								FormField,
								{ theme: theme, key: field.key },
								field.required
									? React.createElement(
											InputLabel,
											{ theme: theme },
											I18n.get(field.label),
											' *'
									  )
									: React.createElement(
											InputLabel,
											{ theme: theme },
											I18n.get(field.label)
									  ),
								React.createElement(Input, {
									autoFocus:
										_this.signUpFields.findIndex(function(f) {
											return f.key === field.key;
										}) === 0
											? true
											: false,
									placeholder: I18n.get(field.placeholder),
									theme: theme,
									type: field.type,
									name: field.key,
									key: field.key,
									onChange: _this.handleInputChange,
									'data-test': auth.signUp.nonPhoneNumberInput,
								})
						  )
						: React.createElement(PhoneField, {
								theme: theme,
								required: field.required,
								defaultDialCode: _this.getDefaultDialCode(),
								label: field.label,
								placeholder: field.placeholder,
								onChangeText: _this.onPhoneNumberChanged,
								key: 'phone_number',
						  });
				})
			),
			React.createElement(
				SectionFooter,
				{ theme: theme, 'data-test': auth.signUp.footerSection },
				React.createElement(
					SectionFooterPrimaryContent,
					{ theme: theme },
					React.createElement(
						Button,
						{
							disabled: this.state.requestPending,
							onClick: this.signUp,
							theme: theme,
							'data-test': auth.signUp.createAccountButton,
						},
						I18n.get('Create Account')
					)
				),
				React.createElement(
					SectionFooterSecondaryContent,
					{ theme: theme },
					I18n.get('Have an account? '),
					React.createElement(
						Link,
						{
							theme: theme,
							onClick: function() {
								return _this.changeState('signIn');
							},
							'data-test': auth.signUp.signInLink,
						},
						I18n.get('Sign in')
					)
				)
			)
		);
	};
	return SignUp;
})(AuthPiece);
export default SignUp;
//# sourceMappingURL=SignUp.js.map
