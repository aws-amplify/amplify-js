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
import {
	FormField,
	LinkCell,
	Header,
	ErrorRow,
	AmplifyButton,
	SignedOutMessage,
	Wrapper,
} from '../AmplifyUI';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

const logger = new Logger('ConfirmSignUp');

interface IConfirmSignUpProps extends IAuthPieceProps {}

interface IConfirmSignUpState extends IAuthPieceState {
	code: string | null;
}

export default class ConfirmSignUp extends AuthPiece<
	IConfirmSignUpProps,
	IConfirmSignUpState
> {
	constructor(props: IConfirmSignUpProps) {
		super(props);

		this._validAuthStates = ['confirmSignUp'];
		this.state = {
			username: null,
			code: null,
			error: null,
		};

		this.confirm = this.confirm.bind(this);
		this.resend = this.resend.bind(this);
	}

	confirm() {
		const { code } = this.state;
		const username = this.getUsernameFromInput();
		logger.debug('Confirm Sign Up for ' + username);
		Auth.confirmSignUp(username, code)
			.then(data => this.changeState('signedUp'))
			.catch(err => this.error(err));
	}

	resend() {
		const username = this.getUsernameFromInput();
		logger.debug('Resend Sign Up for ' + username);
		Auth.resendSignUp(username)
			.then(() => logger.debug('code sent'))
			.catch(err => this.error(err));
	}

	static getDerivedStateFromProps(props, state) {
		const username = props.authData;

		if (username && !state.username) {
			return { [props.usernameAttributes]: username };
		}

		return null;
	}

	showComponent(theme) {
		const username = this.getUsernameFromInput();
		return (
			<Wrapper>
				<View style={theme.section}>
					<View>
						<Header theme={theme} testID={TEST_ID.AUTH.CONFIRM_SIGN_UP_TEXT}>
							{I18n.get('Confirm Sign Up')}
						</Header>
						<View style={theme.sectionBody}>
							{this.renderUsernameField(theme)}
							<FormField
								theme={theme}
								onChangeText={text => this.setState({ code: text })}
								label={I18n.get('Confirmation Code')}
								placeholder={I18n.get('Enter your confirmation code')}
								required={true}
								{...setTestId(TEST_ID.AUTH.CONFIRMATION_CODE_INPUT)}
							/>
							<AmplifyButton
								theme={theme}
								text={I18n.get('Confirm')}
								onPress={this.confirm}
								disabled={!username || !this.state.code}
								{...setTestId(TEST_ID.AUTH.CONFIRM_BUTTON)}
							/>
						</View>
						<View style={theme.sectionFooter}>
							<LinkCell
								theme={theme}
								onPress={this.resend}
								disabled={!this.state.username}
								testID={TEST_ID.AUTH.RESEND_CODE_BUTTON}
							>
								{I18n.get('Resend code')}
							</LinkCell>
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
