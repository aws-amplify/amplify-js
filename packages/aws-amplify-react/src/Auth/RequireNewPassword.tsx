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

import { I18n, ConsoleLogger as Logger, isEmpty } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

import { AuthPiece, IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	Button,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('RequireNewPassword');

export class RequireNewPassword extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this._validAuthStates = ['requireNewPassword'];
		this.change = this.change.bind(this);
		this.checkContact = this.checkContact.bind(this);
	}

	checkContact(user) {
		if (!Auth || typeof Auth.verifiedContact !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifiedContact(user).then((data) => {
			if (!isEmpty(data.verified)) {
				this.changeState('signedIn', user);
			} else {
				user = Object.assign(user, data);
				this.changeState('verifyContact', user);
			}
		});
	}

	change() {
		const user = this.props.authData;
		const { password } = this.inputs;
		const { requiredAttributes } = user.challengeParam;
		const attrs = objectWithProperties(this.inputs, requiredAttributes);

		if (!Auth || typeof Auth.completeNewPassword !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.completeNewPassword(user, password, attrs)
			.then((user) => {
				logger.debug('complete new password', user);
				if (user.challengeName === 'SMS_MFA') {
					this.changeState('confirmSignIn', user);
				} else if (user.challengeName === 'MFA_SETUP') {
					logger.debug('TOTP setup', user.challengeParam);
					this.changeState('TOTPSetup', user);
				} else {
					this.checkContact(user);
				}
			})
			.catch((err) => this.error(err));
	}

	showComponent(theme) {
		const { hide } = this.props;
		if (hide && hide.includes(RequireNewPassword)) {
			return null;
		}

		const user = this.props.authData;
		const { requiredAttributes } = user.challengeParam;

		return (
			<FormSection theme={theme} data-test={auth.requireNewPassword.section}>
				<SectionHeader
					theme={theme}
					data-test={auth.requireNewPassword.headerSection}
				>
					{I18n.get('Change Password')}
				</SectionHeader>
				<SectionBody
					theme={theme}
					data-test={auth.requireNewPassword.bodySection}
				>
					<Input
						autoFocus
						placeholder={I18n.get('New Password')}
						theme={theme}
						key="password"
						name="password"
						type="password"
						onChange={this.handleInputChange}
						data-test={auth.requireNewPassword.newPasswordInput}
					/>

					{requiredAttributes.map((attribute) => (
						<Input
							placeholder={I18n.get(convertToPlaceholder(attribute))}
							theme={theme}
							key={attribute}
							name={attribute}
							type="text"
							onChange={this.handleInputChange}
						/>
					))}
				</SectionBody>
				<SectionFooter theme={theme}>
					<SectionFooterPrimaryContent theme={theme}>
						<Button theme={theme} onClick={this.change}>
							{I18n.get('Change')}
						</Button>
					</SectionFooterPrimaryContent>
					<SectionFooterSecondaryContent theme={theme}>
						<Link
							theme={theme}
							onClick={() => this.changeState('signIn')}
							data-test={auth.requireNewPassword.backToSignInLink}
						>
							{I18n.get('Back to Sign In')}
						</Link>
					</SectionFooterSecondaryContent>
				</SectionFooter>
			</FormSection>
		);
	}
}

function convertToPlaceholder(str) {
	return str
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase())
		.join(' ');
}

function objectWithProperties(obj, keys) {
	const target = {};
	for (const key in obj) {
		if (keys.indexOf(key) === -1) {
			continue;
		}
		if (!Object.prototype.hasOwnProperty.call(obj, key)) {
			continue;
		}
		target[key] = obj[key];
	}
	return target;
}

/**
 * @deprecated use named import
 */
export default RequireNewPassword;
