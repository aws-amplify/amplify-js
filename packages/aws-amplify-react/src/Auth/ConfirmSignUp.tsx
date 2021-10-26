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
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

import { AuthPiece, IAuthPieceProps, IAuthPieceState  } from './AuthPiece';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Button,
	Link,
	InputLabel,
	Input,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
	FormField,
	Hint,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('ConfirmSignUp');

export class ConfirmSignUp extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this._validAuthStates = ['confirmSignUp'];
		this.confirm = this.confirm.bind(this);
		this.resend = this.resend.bind(this);
	}

	confirm() {
		const username = this.usernameFromAuthData() || this.inputs.username;
		const { code } = this.inputs;
		if (!Auth || typeof Auth.confirmSignUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}

		Auth.confirmSignUp(username, code)
			.then(() => this.changeState('signedUp'))
			.catch(err => this.error(err));
	}

	resend() {
		const username = this.usernameFromAuthData() || this.inputs.username;
		if (!Auth || typeof Auth.resendSignUp !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.resendSignUp(username)
			.then(() => logger.debug('code resent'))
			.catch(err => this.error(err));
	}

	showComponent(theme) {
		const { hide } = this.props;
		const username = this.usernameFromAuthData();

		if (hide && hide.includes(ConfirmSignUp)) {
			return null;
		}

		return (
			<FormSection theme={theme} data-test={auth.confirmSignUp.section}>
				<SectionHeader
					theme={theme}
					data-test={auth.confirmSignUp.headerSection}
				>
					{I18n.get('Confirm Sign Up')}
				</SectionHeader>
				<SectionBody theme={theme} data-test={auth.confirmSignUp.bodySection}>
					<FormField theme={theme}>
						<InputLabel theme={theme}>
							{I18n.get(this.getUsernameLabel())} *
						</InputLabel>
						<Input
							placeholder={I18n.get('Username')}
							theme={theme}
							key="username"
							name="username"
							onChange={this.handleInputChange}
							disabled={username}
							value={username ? username : ''}
							data-test={auth.confirmSignUp.usernameInput}
						/>
					</FormField>

					<FormField theme={theme}>
						<InputLabel theme={theme}>
							{I18n.get('Confirmation Code')} *
						</InputLabel>
						<Input
							autoFocus
							placeholder={I18n.get('Enter your code')}
							theme={theme}
							key="code"
							name="code"
							autoComplete="off"
							onChange={this.handleInputChange}
							data-test={auth.confirmSignUp.confirmationCodeInput}
						/>
						<Hint theme={theme}>
							{I18n.get('Lost your code? ')}
							<Link
								theme={theme}
								onClick={this.resend}
								data-test={auth.confirmSignUp.resendCodeLink}
							>
								{I18n.get('Resend Code')}
							</Link>
						</Hint>
					</FormField>
				</SectionBody>
				<SectionFooter theme={theme}>
					<SectionFooterPrimaryContent theme={theme}>
						<Button
							theme={theme}
							onClick={this.confirm}
							data-test={auth.confirmSignUp.confirmButton}
						>
							{I18n.get('Confirm')}
						</Button>
					</SectionFooterPrimaryContent>
					<SectionFooterSecondaryContent theme={theme}>
						<Link
							theme={theme}
							onClick={() => this.changeState('signIn')}
							data-test={auth.confirmSignUp.backToSignInLink}
						>
							{I18n.get('Back to Sign In')}
						</Link>
					</SectionFooterSecondaryContent>
				</SectionFooter>
			</FormSection>
		);
	}
}

/**
 * @deprecated use named import
 */
export default ConfirmSignUp;
