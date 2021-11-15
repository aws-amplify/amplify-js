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

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import {
	FormField,
	PhoneField,
	LinkCell,
	Header,
	ErrorRow,
	AmplifyButton,
	SignedOutMessage,
	Wrapper,
} from '../AmplifyUI';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import countryDialCodes from '../CountryDialCodes';
import signUpWithUsernameFields, {
	signUpWithEmailFields,
	signUpWithPhoneNumberFields,
} from './common/default-sign-up-fields';
import TEST_ID from '../AmplifyTestIDs';
import { ISignUpField } from '../../types';
import { setTestId } from '../Utils';

const logger = new Logger('SignUp');

interface ISignUpConfig {
	defaultCountryCode?: string;
	header?: string;
	hideAllDefaults?: boolean;
	hiddenDefaults?: string[];
	signUpFields?: ISignUpField[];
}

interface ISignUpProps extends IAuthPieceProps {
	signUpConfig?: ISignUpConfig;
}

interface ISignUpState extends IAuthPieceState {
	password?: string | null;
}

export default class SignUp extends AuthPiece<ISignUpProps, ISignUpState> {
	header: string;
	defaultSignUpFields: ISignUpField[];
	signUpFields: ISignUpField[];

	constructor(props: ISignUpProps) {
		super(props);

		this._validAuthStates = ['signUp'];
		this.state = {};
		this.signUp = this.signUp.bind(this);
		this.sortFields = this.sortFields.bind(this);
		this.getDefaultDialCode = this.getDefaultDialCode.bind(this);
		this.checkCustomSignUpFields = this.checkCustomSignUpFields.bind(this);
		this.needPrefix = this.needPrefix.bind(this);
		this.header =
			this.props && this.props.signUpConfig && this.props.signUpConfig.header
				? this.props.signUpConfig.header
				: 'Create a new account';

		const { usernameAttributes = 'username' } = this.props;
		if (usernameAttributes === 'email') {
			this.defaultSignUpFields = signUpWithEmailFields;
		} else if (usernameAttributes === 'phone_number') {
			this.defaultSignUpFields = signUpWithPhoneNumberFields;
		} else {
			this.defaultSignUpFields = signUpWithUsernameFields;
		}
	}

	isValid() {
		for (const el of this.signUpFields) {
			if (el.required && !this.state[el.key]) return false;
		}
		return true;
	}

	sortFields() {
		if (
			this.props.signUpConfig &&
			this.props.signUpConfig.hiddenDefaults &&
			this.props.signUpConfig.hiddenDefaults.length > 0
		) {
			this.defaultSignUpFields = this.defaultSignUpFields.filter((d) => {
				return !this.props.signUpConfig.hiddenDefaults.includes(d.key);
			});
		}

		if (this.checkCustomSignUpFields()) {
			if (!this.props.signUpConfig || !this.props.signUpConfig.hideAllDefaults) {
				// see if fields passed to component should override defaults
				this.defaultSignUpFields.forEach((f, i) => {
					const matchKey = this.signUpFields.findIndex((d) => {
						return d.key === f.key;
					});
					if (matchKey === -1) {
						this.signUpFields.push(f);
					}
				});
			}

			/* 
            sort fields based on following rules:
            1. Fields with displayOrder are sorted before those without displayOrder
            2. Fields with conflicting displayOrder are sorted alphabetically by key
            3. Fields without displayOrder are sorted alphabetically by key
          */
			this.signUpFields.sort((a, b) => {
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
	}

	needPrefix(key) {
		const field = this.signUpFields.find((e) => e.key === key);
		if (key.indexOf('custom:') !== 0) {
			return field.custom;
		} else if (key.indexOf('custom:') === 0 && field.custom === false) {
			logger.warn('Custom prefix prepended to key but custom field flag is set to false');
		}
		return null;
	}

	getDefaultDialCode() {
		return this.props.signUpConfig &&
			this.props.signUpConfig.defaultCountryCode &&
			countryDialCodes.indexOf(`+${this.props.signUpConfig.defaultCountryCode}`) !== -1
			? `+${this.props.signUpConfig.defaultCountryCode}`
			: '+1';
	}

	checkCustomSignUpFields() {
		return (
			this.props.signUpConfig && this.props.signUpConfig.signUpFields && this.props.signUpConfig.signUpFields.length > 0
		);
	}

	signUp() {
		if (!Auth || typeof Auth.signUp !== 'function') {
			throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
		}

		const signup_info = {
			username: this.state.username,
			password: this.state.password,
			attributes: {},
		};

		const inputKeys = Object.keys(this.state);
		const inputVals = Object.values(this.state);

		inputKeys.forEach((key, index) => {
			if (!['username', 'password', 'checkedValue'].includes(key)) {
				if (key !== 'phone_line_number' && key !== 'dial_code' && key !== 'error') {
					const newKey = `${this.needPrefix(key) ? 'custom:' : ''}${key}`;
					signup_info.attributes[newKey] = inputVals[index];
				}
			}
		});

		let labelCheck = false;
		this.signUpFields.forEach((field) => {
			if (field.label === this.getUsernameLabel()) {
				logger.debug(`Changing the username to the value of ${field.label}`);
				signup_info.username = signup_info.attributes[field.key] || signup_info.username;
				labelCheck = true;
			}
		});
		if (!labelCheck && !signup_info.username) {
			// if the customer customized the username field in the sign up form
			// He needs to either set the key of that field to 'username'
			// Or make the label of the field the same as the 'usernameAttributes'
			throw new Error(
				`Couldn't find the label: ${this.getUsernameLabel()}, in sign up fields according to usernameAttributes!`
			);
		}

		logger.debug('Signing up with', signup_info);
		Auth.signUp(signup_info)
			.then((data) => {
				// @ts-ignore
				this.changeState('confirmSignUp', data.user.username);
			})
			.catch((err) => this.error(err));
	}

	showComponent(theme) {
		if (this.checkCustomSignUpFields()) {
			this.signUpFields = this.props.signUpConfig.signUpFields;
		}
		this.sortFields();
		return (
			<Wrapper>
				<ScrollView style={theme.sectionScroll} keyboardShouldPersistTaps="handled">
					<Header theme={theme} testID={TEST_ID.AUTH.SIGN_UP_TEXT}>
						{I18n.get(this.header)}
					</Header>
					<View style={theme.sectionBody}>
						{this.signUpFields.map((field) => {
							return field.key !== 'phone_number' ? (
								<FormField
									key={field.key}
									theme={theme}
									// @ts-ignore
									type={field.type}
									secureTextEntry={field.type === 'password'}
									onChangeText={(text) => {
										const stateObj = this.state;
										stateObj[field.key] = text;
										this.setState(stateObj);
									}}
									label={I18n.get(field.label)}
									placeholder={I18n.get(field.placeholder)}
									required={field.required}
									{...setTestId(field.testID)}
								/>
							) : (
								<PhoneField
									theme={theme}
									key={field.key}
									onChangeText={(text) => this.setState({ phone_number: text })}
									label={I18n.get(field.label)}
									placeholder={I18n.get(field.placeholder)}
									keyboardType="phone-pad"
									required={field.required}
									defaultDialCode={this.getDefaultDialCode()}
									{...setTestId(field.testID)}
								/>
							);
						})}
						<AmplifyButton
							text={I18n.get('Sign Up').toUpperCase()}
							theme={theme}
							onPress={this.signUp}
							disabled={!this.isValid()}
							{...setTestId(TEST_ID.AUTH.SIGN_UP_BUTTON)}
						/>
					</View>
					<View style={theme.sectionFooter}>
						<LinkCell
							theme={theme}
							onPress={() => this.changeState('confirmSignUp')}
							testID={TEST_ID.AUTH.CONFIRM_A_CODE_BUTTON}
						>
							{I18n.get('Confirm a Code')}
						</LinkCell>
						<LinkCell theme={theme} onPress={() => this.changeState('signIn')} testID={TEST_ID.AUTH.SIGN_IN_BUTTON}>
							{I18n.get('Sign In')}
						</LinkCell>
					</View>
					<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
					<SignedOutMessage {...this.props} />
				</ScrollView>
			</Wrapper>
		);
	}
}
