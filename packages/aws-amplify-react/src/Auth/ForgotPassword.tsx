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

import { AuthPiece, IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';

import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	InputLabel,
	Button,
	FormField,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('ForgotPassword');

export interface IForgotPasswordState extends IAuthPieceState {
	delivery: any;
}

export class ForgotPassword extends AuthPiece<
	IAuthPieceProps,
	IForgotPasswordState
> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this.send = this.send.bind(this);
		this.submit = this.submit.bind(this);

		this._validAuthStates = ['forgotPassword'];
		this.state = { delivery: null };
	}

	send() {
		const { authData = {} } = this.props;
		const username = this.getUsernameFromInput() || authData.username;
		if (!Auth || typeof Auth.forgotPassword !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.forgotPassword(username)
			.then(data => {
				logger.debug(data);
				this.setState({ delivery: data.CodeDeliveryDetails });
			})
			.catch(err => this.error(err));
	}

	submit() {
		const { authData = {} } = this.props;
		const { code, password } = this.inputs;
		const username = this.getUsernameFromInput() || authData.username;

		if (!Auth || typeof Auth.forgotPasswordSubmit !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.forgotPasswordSubmit(username, code, password)
			.then(data => {
				logger.debug(data);
				this.changeState('signIn');
				this.setState({ delivery: null });
			})
			.catch(err => this.error(err));
	}

	sendView() {
		const theme = this.props.theme || AmplifyTheme;
		return <div>{this.renderUsernameField(theme)}</div>;
	}

	submitView() {
		const theme = this.props.theme || AmplifyTheme;
		return (
			<div>
				<FormField theme={theme}>
					<InputLabel theme={theme}>{I18n.get('Code')} *</InputLabel>
					<Input
						placeholder={I18n.get('Code')}
						theme={theme}
						key="code"
						name="code"
						autoComplete="off"
						onChange={this.handleInputChange}
					/>
				</FormField>
				<FormField theme={theme}>
					<InputLabel theme={theme}>{I18n.get('New Password')} *</InputLabel>
					<Input
						placeholder={I18n.get('New Password')}
						theme={theme}
						type="password"
						key="password"
						name="password"
						autoComplete="off"
						onChange={this.handleInputChange}
					/>
				</FormField>
			</div>
		);
	}

	showComponent(theme) {
		const { authState, hide, authData = {} } = this.props;
		if (hide && hide.includes(ForgotPassword)) {
			return null;
		}

		return (
			<FormSection theme={theme} data-test={auth.forgotPassword.section}>
				<SectionHeader
					theme={theme}
					data-test={auth.forgotPassword.headerSection}
				>
					{I18n.get('Reset your password')}
				</SectionHeader>
				<SectionBody theme={theme} data-test={auth.forgotPassword.bodySection}>
					{this.state.delivery || authData.username
						? this.submitView()
						: this.sendView()}
				</SectionBody>
				<SectionFooter theme={theme}>
					<SectionFooterPrimaryContent theme={theme}>
						{this.state.delivery || authData.username ? (
							<Button
								theme={theme}
								onClick={this.submit}
								data-test={auth.forgotPassword.submitButton}
							>
								{I18n.get('Submit')}
							</Button>
						) : (
							<Button
								theme={theme}
								onClick={this.send}
								data-test={auth.forgotPassword.sendCodeButton}
							>
								{I18n.get('Send Code')}
							</Button>
						)}
					</SectionFooterPrimaryContent>
					<SectionFooterSecondaryContent theme={theme}>
						{this.state.delivery || authData.username ? (
							<Link
								theme={theme}
								onClick={this.send}
								data-test={auth.forgotPassword.resendCodeLink}
							>
								{I18n.get('Resend Code')}
							</Link>
						) : (
							<Link
								theme={theme}
								onClick={() => this.changeState('signIn')}
								data-test={auth.forgotPassword.backToSignInLink}
							>
								{I18n.get('Back to Sign In')}
							</Link>
						)}
					</SectionFooterSecondaryContent>
				</SectionFooter>
			</FormSection>
		);
	}
}

/**
 * @deprecated use named import
 */
export default ForgotPassword;
