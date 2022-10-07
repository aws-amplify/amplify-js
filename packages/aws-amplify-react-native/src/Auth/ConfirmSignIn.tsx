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
import { AmplifyButton, FormField, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { AmplifyThemeType } from '../AmplifyTheme';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

const logger = new Logger('ConfirmSignIn');

interface IConfirmSignInProps extends IAuthPieceProps {}

interface IConfirmSignInState extends IAuthPieceState {
	code?: string;
}

export default class ConfirmSignIn extends AuthPiece<IConfirmSignInProps, IConfirmSignInState> {
	constructor(props: IConfirmSignInProps) {
		super(props);

		this._validAuthStates = ['confirmSignIn'];
		this.state = {
			code: null as never,
			error: null,
		};

		this.confirm = this.confirm.bind(this);
		this.checkContact = this.checkContact.bind(this);
	}

	confirm() {
		const user = this.props.authData;
		const { code } = this.state;
		logger.debug('Confirm Sign In for ' + user.username);
		Auth.confirmSignIn(user, code!)
			.then((data) => this.checkContact(user))
			.catch((err) => this.error(err));
	}

	showComponent(theme: AmplifyThemeType) {
		return (
			<Wrapper>
				<View style={theme.section}>
					<View>
						<Header theme={theme} testID={TEST_ID.AUTH.CONFIRM_SIGN_IN_TEXT}>
							{I18n.get('Confirm Sign In')}
						</Header>
						<View style={theme.sectionBody}>
							<FormField
								theme={theme}
								onChangeText={(text) => this.setState({ code: text })}
								label={I18n.get('Confirmation Code')}
								placeholder={I18n.get('Enter your confirmation code')}
								required={true}
								{...setTestId(TEST_ID.AUTH.CONFIRMATION_CODE_INPUT)}
							/>
							<AmplifyButton
								theme={theme}
								text={I18n.get('Confirm')}
								onPress={this.confirm}
								disabled={!this.state.code}
								{...setTestId(TEST_ID.AUTH.CONFIRM_BUTTON)}
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
					</View>
					<SignedOutMessage {...this.props} />
				</View>
			</Wrapper>
		);
	}
}
