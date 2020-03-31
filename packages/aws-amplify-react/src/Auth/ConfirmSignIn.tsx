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

import { I18n, isEmpty } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

import { AuthPiece, IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import {
	FormSection,
	FormField,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	InputLabel,
	Button,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { auth } from '../Amplify-UI/data-test-attributes';

export interface IConfirmSignInState extends IAuthPieceState {
	mfaType: string;
}

export class ConfirmSignIn extends AuthPiece<
	IAuthPieceProps,
	IConfirmSignInState
> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this._validAuthStates = ['confirmSignIn'];
		this.confirm = this.confirm.bind(this);
		this.checkContact = this.checkContact.bind(this);
		this.state = {
			mfaType: 'SMS',
		};
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
				const newUser = Object.assign(user, data);
				this.changeState('verifyContact', newUser);
			}
		});
	}

	confirm(event) {
		if (event) {
			event.preventDefault();
		}
		const user = this.props.authData;
		const { code } = this.inputs;
		const mfaType =
			user.challengeName === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : null;
		if (!Auth || typeof Auth.confirmSignIn !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}

		Auth.confirmSignIn(user, code, mfaType)
			.then(() => {
				this.checkContact(user);
			})
			.catch(err => this.error(err));
	}

	componentDidUpdate() {
		// logger.debug('component did update with props', this.props);
		const user = this.props.authData;
		const mfaType =
			user && user.challengeName === 'SOFTWARE_TOKEN_MFA' ? 'TOTP' : 'SMS';
		if (this.state.mfaType !== mfaType) this.setState({ mfaType });
	}

	showComponent(theme) {
		const { hide } = this.props;
		if (hide && hide.includes(ConfirmSignIn)) {
			return null;
		}

		return (
			<FormSection theme={theme} data-test={auth.confirmSignIn.section}>
				<SectionHeader
					theme={theme}
					data-test={auth.confirmSignIn.headerSection}
				>
					{I18n.get('Confirm ' + this.state.mfaType + ' Code')}
				</SectionHeader>
				<form
					onSubmit={this.confirm}
					data-test={auth.confirmSignIn.bodySection}
				>
					<SectionBody theme={theme}>
						<FormField theme={theme}>
							<InputLabel theme={theme}>{I18n.get('Code')} *</InputLabel>
							<Input
								autoFocus
								placeholder={I18n.get('Code')}
								theme={theme}
								key="code"
								name="code"
								autoComplete="off"
								onChange={this.handleInputChange}
								data-test={auth.confirmSignIn.codeInput}
							/>
						</FormField>
					</SectionBody>
					<SectionFooter theme={theme}>
						<SectionFooterPrimaryContent
							theme={theme}
							data-test={auth.confirmSignIn.confirmButton}
						>
							<Button theme={theme} type="submit">
								{I18n.get('Confirm')}
							</Button>
						</SectionFooterPrimaryContent>
						<SectionFooterSecondaryContent theme={theme}>
							<Link
								theme={theme}
								onClick={() => this.changeState('signIn')}
								data-test={auth.confirmSignIn.backToSignInLink}
							>
								{I18n.get('Back to Sign In')}
							</Link>
						</SectionFooterSecondaryContent>
					</SectionFooter>
				</form>
			</FormSection>
		);
	}
}

/**
 * @deprecated use named import
 */
export default ConfirmSignIn;
