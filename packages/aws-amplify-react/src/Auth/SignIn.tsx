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

import * as React from 'react';
import { I18n, isEmpty, ConsoleLogger as Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

import { AuthPiece, IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { FederatedButtons } from './FederatedSignIn';
import { SignUp } from './SignUp';
import { ForgotPassword } from './ForgotPassword';

import {
	FormSection,
	FormField,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Button,
	Link,
	Hint,
	Input,
	InputLabel,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('SignIn');

export interface ISignInProps extends IAuthPieceProps {
	federated?: any;
	override?: any;
}

export interface ISignInState extends IAuthPieceState {
	loading?: boolean;
}

export class SignIn extends AuthPiece<ISignInProps, ISignInState> {
	constructor(props: ISignInProps) {
		super(props);

		this.checkContact = this.checkContact.bind(this);
		this.signIn = this.signIn.bind(this);

		this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
		this.state = {};
	}

	checkContact(user) {
		if (!Auth || typeof Auth.verifiedContact !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifiedContact(user).then(data => {
			if (!isEmpty(data.verified)) {
				this.changeState('signedIn', user);
			} else {
				user = Object.assign(user, data);
				this.changeState('verifyContact', user);
			}
		});
	}

	async signIn(event) {
		// avoid submitting the form
		if (event) {
			event.preventDefault();
		}

		const username = this.getUsernameFromInput() || '';
		const password = this.inputs.password;

		if (!Auth || typeof Auth.signIn !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		this.setState({ loading: true });
		try {
			const user = await Auth.signIn(username, password);
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
		} catch (err) {
			if (err.code === 'UserNotConfirmedException') {
				logger.debug('the user is not confirmed');
				this.changeState('confirmSignUp', { username });
			} else if (err.code === 'PasswordResetRequiredException') {
				logger.debug('the user requires a new password');
				this.changeState('forgotPassword', { username });
			} else {
				this.error(err);
			}
		} finally {
			this.setState({ loading: false });
		}
	}

	showComponent(theme) {
		const {
			authState,
			hide = [],
			federated,
			onStateChange,
			onAuthEvent,
			override = [],
		} = this.props;
		if (hide && hide.includes(SignIn)) {
			return null;
		}
		const hideSignUp =
			!override.includes('SignUp') &&
			hide.some(component => component === SignUp);
		const hideForgotPassword =
			!override.includes('ForgotPassword') &&
			hide.some(component => component === ForgotPassword);
		return (
			<FormSection theme={theme} data-test={auth.signIn.section}>
				<SectionHeader theme={theme} data-test={auth.signIn.headerSection}>
					{I18n.get('Sign in to your account')}
				</SectionHeader>
				<FederatedButtons
					federated={federated}
					theme={theme}
					authState={authState}
					onStateChange={onStateChange}
					onAuthEvent={onAuthEvent}
				/>
				<form onSubmit={this.signIn}>
					<SectionBody theme={theme}>
						{this.renderUsernameField(theme)}
						<FormField theme={theme}>
							<InputLabel theme={theme}>{I18n.get('Password')} *</InputLabel>
							<Input
								placeholder={I18n.get('Enter your password')}
								theme={theme}
								key="password"
								type="password"
								name="password"
								onChange={this.handleInputChange}
								data-test={auth.signIn.passwordInput}
							/>
							{!hideForgotPassword && (
								<Hint theme={theme}>
									{I18n.get('Forgot your password? ')}
									<Link
										theme={theme}
										onClick={() => this.changeState('forgotPassword')}
										data-test={auth.signIn.forgotPasswordLink}
									>
										{I18n.get('Reset password')}
									</Link>
								</Hint>
							)}
						</FormField>
					</SectionBody>
					<SectionFooter theme={theme} data-test={auth.signIn.footerSection}>
						<SectionFooterPrimaryContent theme={theme}>
							<Button
								theme={theme}
								type="submit"
								disabled={this.state.loading}
								data-test={auth.signIn.signInButton}
							>
								{I18n.get('Sign In')}
							</Button>
						</SectionFooterPrimaryContent>
						{!hideSignUp && (
							<SectionFooterSecondaryContent theme={theme}>
								{I18n.get('No account? ')}
								<Link
									theme={theme}
									onClick={() => this.changeState('signUp')}
									data-test={auth.signIn.createAccountLink}
								>
									{I18n.get('Create account')}
								</Link>
							</SectionFooterSecondaryContent>
						)}
					</SectionFooter>
				</form>
			</FormSection>
		);
	}
}

/**
 * @deprecated use named import
 */
export default SignIn;
