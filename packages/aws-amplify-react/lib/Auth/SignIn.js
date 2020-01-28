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
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
var auth_1 = require('@aws-amplify/auth');
var AuthPiece_1 = require('./AuthPiece');
var FederatedSignIn_1 = require('./FederatedSignIn');
var SignUp_1 = require('./SignUp');
var ForgotPassword_1 = require('./ForgotPassword');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var logger = new core_1.ConsoleLogger('SignIn');
var SignIn = /** @class */ (function(_super) {
	__extends(SignIn, _super);
	function SignIn(props) {
		var _this = _super.call(this, props) || this;
		_this.checkContact = _this.checkContact.bind(_this);
		_this.signIn = _this.signIn.bind(_this);
		_this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
		_this.state = {};
		return _this;
	}
	SignIn.prototype.checkContact = function(user) {
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
	SignIn.prototype.signIn = function(event) {
		return __awaiter(this, void 0, void 0, function() {
			var username, password, user, err_1;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						// avoid submitting the form
						if (event) {
							event.preventDefault();
						}
						username = this.getUsernameFromInput() || '';
						password = this.inputs.password;
						if (
							!auth_1.default ||
							typeof auth_1.default.signIn !== 'function'
						) {
							throw new Error(
								'No Auth module found, please ensure @aws-amplify/auth is imported'
							);
						}
						this.setState({ loading: true });
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, 4, 5]);
						return [4 /*yield*/, auth_1.default.signIn(username, password)];
					case 2:
						user = _a.sent();
						logger.debug(user);
						if (
							user.challengeName === 'SMS_MFA' ||
							user.challengeName === 'SOFTWARE_TOKEN_MFA'
						) {
							logger.debug('confirm user with ' + user.challengeName);
							this.changeState('confirmSignIn', user);
						} else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
							logger.debug('require new password', user.challengeParam);
							this.changeState('requireNewPassword', user);
						} else if (user.challengeName === 'MFA_SETUP') {
							logger.debug('TOTP setup', user.challengeParam);
							this.changeState('TOTPSetup', user);
						} else if (
							user.challengeName === 'CUSTOM_CHALLENGE' &&
							user.challengeParam &&
							user.challengeParam.trigger === 'true'
						) {
							logger.debug('custom challenge', user.challengeParam);
							this.changeState('customConfirmSignIn', user);
						} else {
							this.checkContact(user);
						}
						return [3 /*break*/, 5];
					case 3:
						err_1 = _a.sent();
						if (err_1.code === 'UserNotConfirmedException') {
							logger.debug('the user is not confirmed');
							this.changeState('confirmSignUp', { username: username });
						} else if (err_1.code === 'PasswordResetRequiredException') {
							logger.debug('the user requires a new password');
							this.changeState('forgotPassword', { username: username });
						} else {
							this.error(err_1);
						}
						return [3 /*break*/, 5];
					case 4:
						this.setState({ loading: false });
						return [7 /*endfinally*/];
					case 5:
						return [2 /*return*/];
				}
			});
		});
	};
	SignIn.prototype.showComponent = function(theme) {
		var _this = this;
		var _a = this.props,
			authState = _a.authState,
			_b = _a.hide,
			hide = _b === void 0 ? [] : _b,
			federated = _a.federated,
			onStateChange = _a.onStateChange,
			onAuthEvent = _a.onAuthEvent,
			_c = _a.override,
			override = _c === void 0 ? [] : _c;
		if (hide && hide.includes(SignIn)) {
			return null;
		}
		var hideSignUp =
			!override.includes('SignUp') &&
			hide.some(function(component) {
				return component === SignUp_1.default;
			});
		var hideForgotPassword =
			!override.includes('ForgotPassword') &&
			hide.some(function(component) {
				return component === ForgotPassword_1.default;
			});
		return React.createElement(
			Amplify_UI_Components_React_1.FormSection,
			{ theme: theme, 'data-test': data_test_attributes_1.auth.signIn.section },
			React.createElement(
				Amplify_UI_Components_React_1.SectionHeader,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.signIn.headerSection,
				},
				core_1.I18n.get('Sign in to your account')
			),
			React.createElement(FederatedSignIn_1.FederatedButtons, {
				federated: federated,
				theme: theme,
				authState: authState,
				onStateChange: onStateChange,
				onAuthEvent: onAuthEvent,
			}),
			React.createElement(
				'form',
				{ onSubmit: this.signIn },
				React.createElement(
					Amplify_UI_Components_React_1.SectionBody,
					{ theme: theme },
					this.renderUsernameField(theme),
					React.createElement(
						Amplify_UI_Components_React_1.FormField,
						{ theme: theme },
						React.createElement(
							Amplify_UI_Components_React_1.InputLabel,
							{ theme: theme },
							core_1.I18n.get('Password'),
							' *'
						),
						React.createElement(Amplify_UI_Components_React_1.Input, {
							placeholder: core_1.I18n.get('Enter your password'),
							theme: theme,
							key: 'password',
							type: 'password',
							name: 'password',
							onChange: this.handleInputChange,
							'data-test': data_test_attributes_1.auth.signIn.passwordInput,
						}),
						!hideForgotPassword &&
							React.createElement(
								Amplify_UI_Components_React_1.Hint,
								{ theme: theme },
								core_1.I18n.get('Forget your password? '),
								React.createElement(
									Amplify_UI_Components_React_1.Link,
									{
										theme: theme,
										onClick: function() {
											return _this.changeState('forgotPassword');
										},
										'data-test':
											data_test_attributes_1.auth.signIn.forgotPasswordLink,
									},
									core_1.I18n.get('Reset password')
								)
							)
					)
				),
				React.createElement(
					Amplify_UI_Components_React_1.SectionFooter,
					{
						theme: theme,
						'data-test': data_test_attributes_1.auth.signIn.footerSection,
					},
					React.createElement(
						Amplify_UI_Components_React_1.SectionFooterPrimaryContent,
						{ theme: theme },
						React.createElement(
							Amplify_UI_Components_React_1.Button,
							{
								theme: theme,
								type: 'submit',
								disabled: this.state.loading,
								'data-test': data_test_attributes_1.auth.signIn.signInButton,
							},
							core_1.I18n.get('Sign In')
						)
					),
					!hideSignUp &&
						React.createElement(
							Amplify_UI_Components_React_1.SectionFooterSecondaryContent,
							{ theme: theme },
							core_1.I18n.get('No account? '),
							React.createElement(
								Amplify_UI_Components_React_1.Link,
								{
									theme: theme,
									onClick: function() {
										return _this.changeState('signUp');
									},
									'data-test':
										data_test_attributes_1.auth.signIn.createAccountLink,
								},
								core_1.I18n.get('Create account')
							)
						)
				)
			)
		);
	};
	return SignIn;
})(AuthPiece_1.default);
exports.default = SignIn;
//# sourceMappingURL=SignIn.js.map
