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
import { FormField, AmplifyButton, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { AmplifyThemeType } from '../AmplifyTheme';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

const logger = new Logger('RequireNewPassword');

interface IRequireNewPasswordProps extends IAuthPieceProps {}

interface IRequireNewPasswordState extends IAuthPieceState {
	password?: string;
	// TODO: Add required attributes keys
	requiredAttributes: Record<string, any>;
}

export default class RequireNewPassword extends AuthPiece<IRequireNewPasswordProps, IRequireNewPasswordState> {
	constructor(props: IRequireNewPasswordProps) {
		super(props);

		this._validAuthStates = ['requireNewPassword'];
		this.state = {
			password: null as never,
			error: null,
			requiredAttributes: {},
		};

		this.change = this.change.bind(this);
	}

	change() {
		const user = this.props.authData;
		const { password, requiredAttributes } = this.state;
		logger.debug('Require new password for ' + user.username);
		Auth.completeNewPassword(user, password!, requiredAttributes)
			.then((user) => {
				if (user.challengeName === 'SMS_MFA') {
					this.changeState('confirmSignIn', user);
				} else {
					this.checkContact(user);
				}
			})
			.catch((err) => this.error(err));
	}

	generateForm(attribute: string, theme: AmplifyThemeType) {
		return (
			<FormField
				theme={theme}
				onChangeText={(text) => {
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

	showComponent(theme: AmplifyThemeType) {
		const user = this.props.authData;
		const { requiredAttributes } = user.challengeParam;
		return (
			<Wrapper>
				<ScrollView style={theme.sectionScroll}>
					<Header theme={theme} testID={TEST_ID.AUTH.CHANGE_PASSWORD_TEXT}>
						{I18n.get('Change Password')}
					</Header>
					<View style={theme.sectionBody}>
						<FormField
							theme={theme}
							onChangeText={(text) => this.setState({ password: text })}
							label={I18n.get('Password')}
							placeholder={I18n.get('Enter your password')}
							secureTextEntry={true}
							required={true}
							{...setTestId(TEST_ID.AUTH.PASSWORD_INPUT)}
						/>
						{requiredAttributes.map((attribute) => {
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
									Object.keys(this.state.requiredAttributes).length === Object.keys(requiredAttributes).length
								)
							}
							{...setTestId(TEST_ID.AUTH.CHANGE_PASSWORD_BUTTON)}
						/>
					</View>
					<View style={theme.sectionFooter}>
						<LinkCell
							theme={theme}
							onPress={() => this.changeState('signIn')}
							testID={TEST_ID.AUTH.BACK_TO_SIGN_IN_BUTTON}
						>
							{I18n.get('Back to Sign In')}
						</LinkCell>
					</View>
					<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
					<SignedOutMessage {...this.props} />
				</ScrollView>
			</Wrapper>
		);
	}
}

function convertToPlaceholder(str: string) {
	return str
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase())
		.join(' ');
}
