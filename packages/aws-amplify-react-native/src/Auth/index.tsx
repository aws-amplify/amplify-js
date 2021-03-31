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
import { Logger } from 'aws-amplify';
import Authenticator from './Authenticator';
import AuthPiece from './AuthPiece';
import Loading from './Loading';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import SignUp from './SignUp';
import ConfirmSignUp from './ConfirmSignUp';
import ForgotPassword from './ForgotPassword';
import RequireNewPassword from './RequireNewPassword';
import VerifyContact from './VerifyContact';
import Greetings from './Greetings';
import withOAuth from './withOAuth';
import { AmplifyThemeType } from '../AmplifyTheme';
import { ISignUpConfig, OnStateChangeType } from '../../types';

const logger = new Logger('auth components');

export {
	Authenticator,
	AuthPiece,
	SignIn,
	ConfirmSignIn,
	SignUp,
	ConfirmSignUp,
	ForgotPassword,
	Loading,
	RequireNewPassword,
	VerifyContact,
	Greetings,
	withOAuth,
};

interface IWithAuthenticatorProps {
	authState?: string;
	onStateChange?: OnStateChangeType;
}

interface IWithAuthenticatorState {
	authData?: any;
	authState: string;
}

export function withAuthenticator<Props extends object>(
	Comp: React.ComponentType<Props>,
	includeGreetings: boolean | { [index: string]: any } = false,
	authenticatorComponents = [],
	federated = null,
	theme: AmplifyThemeType = null,
	signUpConfig: ISignUpConfig = {}
) {
	class Wrapper extends React.Component<
		Props & IWithAuthenticatorProps,
		IWithAuthenticatorState
	> {
		authConfig: any;

		constructor(props: Props & IWithAuthenticatorProps) {
			super(props);

			this.handleAuthStateChange = this.handleAuthStateChange.bind(this);

			this.state = { authState: props.authState };

			this.authConfig = {};

			if (typeof includeGreetings === 'object' && includeGreetings !== null) {
				if (includeGreetings.theme) {
					theme = includeGreetings.theme;
				}
				this.authConfig = Object.assign(this.authConfig, includeGreetings);
			} else {
				this.authConfig = {
					includeGreetings,
					authenticatorComponents,
					signUpConfig,
				};
			}
		}

		handleAuthStateChange(state: string, data?: any) {
			this.setState({ authState: state, authData: data });
			if (this.props.onStateChange) {
				this.props.onStateChange(state, data);
			}
		}

		render() {
			const { authState, authData } = this.state;
			const signedIn = authState === 'signedIn';
			if (signedIn) {
				if (!this.authConfig.includeGreetings) {
					return (
						<Comp
							{...this.props}
							authState={authState}
							authData={authData}
							onStateChange={this.handleAuthStateChange}
						/>
					);
				}

				return (
					<View style={{ flex: 1 }}>
						<Greetings
							authState={authState}
							authData={authData}
							onStateChange={this.handleAuthStateChange}
							theme={theme}
							usernameAttributes={this.authConfig.usernameAttributes}
						/>
						<Comp
							{...this.props}
							authState={authState}
							authData={authData}
							onStateChange={this.handleAuthStateChange}
						/>
					</View>
				);
			}

			return (
				<Authenticator
					{...this.props}
					hideDefault={
						this.authConfig.authenticatorComponents &&
						this.authConfig.authenticatorComponents.length > 0
					}
					signUpConfig={this.authConfig.signUpConfig}
					onStateChange={this.handleAuthStateChange}
					children={this.authConfig.authenticatorComponents}
					usernameAttributes={this.authConfig.usernameAttributes}
					theme={theme}
				/>
			);
		}
	}

	Object.keys(Comp).forEach(key => {
		// Copy static properties in order to be as close to Comp as possible.
		// One particular case is navigationOptions
		try {
			const excludes = ['displayName', 'childContextTypes'];
			if (excludes.includes(key)) {
				return;
			}

			Wrapper[key] = Comp[key];
		} catch (err) {
			logger.warn('not able to assign ' + key, err);
		}
	});

	return Wrapper;
}
