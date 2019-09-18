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
import {
	View,
	TouchableWithoutFeedback,
	Keyboard,
	ScrollView,
} from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import {
	FormField,
	AmplifyButton,
	LinkCell,
	Header,
	ErrorRow,
} from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('RequireNewPassword');

export default class RequireNewPassword extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['requireNewPassword'];
		this.state = {
			password: null,
			error: null,
			requiredAttributes: {},
		};

		this.change = this.change.bind(this);
	}

	change() {
		const user = this.props.authData;
		const { password, requiredAttributes } = this.state;
		logger.debug('Require new password for ' + user.username);
		Auth.completeNewPassword(user, password, requiredAttributes)
			.then(user => {
				if (user.challengeName === 'SMS_MFA') {
					this.changeState('confirmSignIn', user);
				} else {
					this.checkContact(user);
				}
			})
			.catch(err => this.error(err));
	}

	generateForm(attribute, theme) {
		return (
			<FormField
				theme={theme}
				onChangeText={text => {
					const attributes = this.state.requiredAttributes;
					if (text !== '') attributes[attribute] = text;
					else delete attributes[attribute];
					this.setState({ requiredAttributes: attributes });
				}}
				label={I18n.get(convertToPlaceholder(attribute))}
				key={I18n.get(convertToPlaceholder(attribute))}
				placeholder={I18n.get(convertToPlaceholder(attribute))}
				required={true}
			/>
		);
	}

	showComponent(theme) {
		const user = this.props.authData;
		const { requiredAttributes } = user.challengeParam;
		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ScrollView style={theme.section}>
					<Header theme={theme}>{I18n.get('Change Password')}</Header>
					<View style={theme.sectionBody}>
						<FormField
							theme={theme}
							onChangeText={text => this.setState({ password: text })}
							label={I18n.get('Password')}
							placeholder={I18n.get('Enter your password')}
							secureTextEntry={true}
							required={true}
						/>
						{requiredAttributes.map(attribute => {
							logger.debug('attributes', attribute);
							return this.generateForm(attribute, theme);
						})}
						<AmplifyButton
							text={I18n.get('Change Password')}
							onPress={this.change}
							theme={theme}
							disabled={
								!(
									this.state.password &&
									Object.keys(this.state.requiredAttributes).length ===
										Object.keys(requiredAttributes).length
								)
							}
						/>
					</View>
					<View style={theme.sectionFooter}>
						<LinkCell theme={theme} onPress={() => this.changeState('signIn')}>
							{I18n.get('Back to Sign In')}
						</LinkCell>
					</View>
					<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
				</ScrollView>
			</TouchableWithoutFeedback>
		);
	}
}

function convertToPlaceholder(str) {
	return str
		.split('_')
		.map(part => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase())
		.join(' ');
}
