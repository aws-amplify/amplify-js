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
import { View, Text } from 'react-native';
import { Auth, I18n } from 'aws-amplify';
import { AmplifyButton } from '../AmplifyUI';
import AmplifyTheme from '../AmplifyTheme';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

interface IGreetingsProps extends IAuthPieceProps {
	signedInMessage?: string;
	signedOutMessage?: string;
}

interface IGreetingsState extends IAuthPieceState {}

export default class Greetings extends AuthPiece<IGreetingsProps, IGreetingsState> {
	constructor(props: IGreetingsProps) {
		super(props);
		this._validAuthStates = ['signedIn'];
		this.signOut = this.signOut.bind(this);
		this.getMessage = this.getMessage.bind(this);
	}

	signOut() {
		Auth.signOut()
			.then(() => this.changeState('signedOut'))
			.catch((err) => this.error(err));
	}

	getMessage() {
		const { authData } = this.props;
		let defaultMessage = '';
		const user = authData;
		if (user) {
			const { usernameAttributes = [] } = this.props;
			let name = '';
			if (usernameAttributes === 'email') {
				// Email as Username
				name = user.attributes ? user.attributes.email : user.username;
				defaultMessage = `${name}`;
			} else if (usernameAttributes === 'phone_number') {
				// Phone number as Username
				name = user.attributes ? user.attributes.phone_number : user.username;
				defaultMessage = `${name}`;
			} else {
				name = user.username || 'unknown user';
				defaultMessage = `${I18n.get('Hello')} ${name}`;
			}
		}
		return this.props.signedInMessage || defaultMessage;
	}

	showComponent() {
		const theme = this.props.theme || AmplifyTheme;
		return (
			<View style={theme.navBar}>
				<Text style={theme.greetingMessage} {...setTestId(TEST_ID.AUTH.GREETING_SIGNED_IN_TEXT)}>
					{this.getMessage()}
				</Text>
				<AmplifyButton
					theme={theme}
					text={I18n.get('Sign Out')}
					onPress={this.signOut}
					style={theme.navButton}
					{...setTestId(TEST_ID.AUTH.SIGN_OUT_BUTTON)}
				/>
			</View>
		);
	}
}
