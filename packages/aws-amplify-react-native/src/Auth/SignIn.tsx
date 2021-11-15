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
import { View } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { AmplifyButton, FormField, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import { AmplifyThemeType } from '../AmplifyTheme';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

const logger = new Logger('SignIn');

interface ISignInProps extends IAuthPieceProps {}

interface ISignInState extends IAuthPieceState {
	password?: string;
	hasPendingSignIn: boolean;
}

export default class SignIn extends AuthPiece<ISignInProps, ISignInState> {
	constructor(props: ISignInProps) {
		super(props);

		this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
		this.state = {
			username: null,
			password: null,
			error: null,
			hasPendingSignIn: false,
		};

		this.checkContact = this.checkContact.bind(this);
		this.signIn = this.signIn.bind(this);
	}

	async signIn() {
		const { password, hasPendingSignIn } = this.state;

		if (hasPendingSignIn) {
			logger.debug('Previous sign in attempt active');
			return;
		}

		this.setState({ hasPendingSignIn: true });
		const username = this.getUsernameFromInput() || '';
		logger.debug('Sign In for ' + username);
		await Auth.signIn(username, password)
			.then((user) => {
				logger.debug(user);
				if (user.challengeName === 'SMS_MFA') {
					this.changeState('confirmSignIn', user);
				} else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
					logger.debug('require new password', user.challengeParam);
					this.changeState('requireNewPassword', user);
				} else {
					this.checkContact(user);
				}
			})
			.catch((err) => {
				if (err.code === 'PasswordResetRequiredException') {
					logger.debug('the user requires a new password');
					this.changeState('forgotPassword', username);
				} else {
					this.error(err);
				}
			});
		this.setState({ hasPendingSignIn: false });
	}

	showComponent(theme: AmplifyThemeType) {
		const { hasPendingSignIn, password } = this.state;
		return (
			<Wrapper>
				<View style={theme.section}>
					<View>
						<Header theme={theme} testID={TEST_ID.AUTH.SIGN_IN_TO_YOUR_ACCOUNT_TEXT}>
							{I18n.get('Sign in to your account')}
						</Header>
						<View style={theme.sectionBody}>
							{this.renderUsernameField(theme)}
							<FormField
								theme={theme}
								onChangeText={(text) => this.setState({ password: text })}
								label={I18n.get('Password')}
								placeholder={I18n.get('Enter your password')}
								secureTextEntry={true}
								required={true}
								{...setTestId(TEST_ID.AUTH.PASSWORD_INPUT)}
							/>
							<AmplifyButton
								text={I18n.get('Sign In').toUpperCase()}
								theme={theme}
								onPress={this.signIn}
								disabled={!!(!this.getUsernameFromInput() && password) || hasPendingSignIn}
								{...setTestId(TEST_ID.AUTH.SIGN_IN_BUTTON)}
							/>
						</View>
						<View style={theme.sectionFooter}>
							<LinkCell
								theme={theme}
								onPress={() => this.changeState('forgotPassword')}
								testID={TEST_ID.AUTH.FORGOT_PASSWORD_BUTTON}
							>
								{I18n.get('Forgot Password')}
							</LinkCell>
							<LinkCell theme={theme} onPress={() => this.changeState('signUp')} testID={TEST_ID.AUTH.SIGN_UP_BUTTON}>
								{I18n.get('Sign Up')}
							</LinkCell>
						</View>
						<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
					</View>
					<SignedOutMessage {...this.props} />
				</View>
			</Wrapper>
		);
	}
}
