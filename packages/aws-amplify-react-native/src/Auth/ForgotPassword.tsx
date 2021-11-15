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
import { FormField, AmplifyButton, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { AmplifyThemeType } from '../AmplifyTheme';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

const logger = new Logger('ForgotPassword');

interface IForgotPasswordProps extends IAuthPieceProps {}

interface IForgotPasswordState extends IAuthPieceState {
	code?: string;
	delivery?: any;
	password?: string;
}

export default class ForgotPassword extends AuthPiece<IForgotPasswordProps, IForgotPasswordState> {
	constructor(props: IForgotPasswordProps) {
		super(props);

		this._validAuthStates = ['forgotPassword'];
		this.state = { delivery: null };

		this.send = this.send.bind(this);
		this.submit = this.submit.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		const username = props.authData;

		if (username && !state.username) {
			return { username };
		}

		return null;
	}

	send() {
		const username = this.getUsernameFromInput();
		if (!username) {
			this.error('Username cannot be empty');
			return;
		}
		Auth.forgotPassword(username)
			.then((data) => {
				logger.debug(data);
				this.setState({ delivery: data.CodeDeliveryDetails });
			})
			.catch((err) => this.error(err));
	}

	submit() {
		const { code, password } = this.state;
		const username = this.getUsernameFromInput();
		Auth.forgotPasswordSubmit(username, code, password)
			.then((data) => {
				logger.debug(data);
				this.changeState('signIn');
			})
			.catch((err) => this.error(err));
	}

	forgotBody(theme: AmplifyThemeType) {
		return (
			<View style={theme.sectionBody}>
				{this.renderUsernameField(theme)}
				<AmplifyButton
					text={I18n.get('Send').toUpperCase()}
					theme={theme}
					onPress={this.send}
					disabled={!this.getUsernameFromInput()}
					{...setTestId(TEST_ID.AUTH.SEND_BUTTON)}
				/>
			</View>
		);
	}

	submitBody(theme: AmplifyThemeType) {
		return (
			<View style={theme.sectionBody}>
				<FormField
					theme={theme}
					onChangeText={(text) => this.setState({ code: text })}
					label={I18n.get('Confirmation Code')}
					placeholder={I18n.get('Enter your confirmation code')}
					required={true}
					{...setTestId(TEST_ID.AUTH.CONFIRMATION_CODE_INPUT)}
				/>
				<FormField
					theme={theme}
					onChangeText={(text) => this.setState({ password: text })}
					label={I18n.get('Password')}
					placeholder={I18n.get('Enter your new password')}
					secureTextEntry={true}
					required={true}
					{...setTestId(TEST_ID.AUTH.PASSWORD_INPUT)}
				/>
				<AmplifyButton
					text={I18n.get('Submit')}
					theme={theme}
					onPress={this.submit}
					disabled={!(this.state.code && this.state.password)}
					{...setTestId(TEST_ID.AUTH.SUBMIT_BUTTON)}
				/>
			</View>
		);
	}

	showComponent(theme: AmplifyThemeType) {
		return (
			<Wrapper>
				<View style={theme.section}>
					<View>
						<Header theme={theme} testID={TEST_ID.AUTH.FORGOT_PASSWORD_TEXT}>
							{I18n.get('Reset your password')}
						</Header>
						<View style={theme.sectionBody}>
							{!this.state.delivery && this.forgotBody(theme)}
							{this.state.delivery && this.submitBody(theme)}
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
					</View>
					<SignedOutMessage {...this.props} />
				</View>
			</Wrapper>
		);
	}
}
