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
import AmplifyTheme from '../AmplifyTheme';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	Input,
	RadioRow,
	Button,
	Link,
	SectionFooterPrimaryContent,
	SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('VerifyContact');

export interface IVerifyContactState extends IAuthPieceState {
	verifyAttr: any;
}

export class VerifyContact extends AuthPiece<
	IAuthPieceProps,
	IVerifyContactState
> {
	constructor(props: IAuthPieceProps) {
		super(props);

		this._validAuthStates = ['verifyContact'];
		this.verify = this.verify.bind(this);
		this.submit = this.submit.bind(this);

		this.state = { verifyAttr: null };
	}

	verify() {
		const { contact, checkedValue } = this.inputs;
		if (!contact) {
			this.error('Neither Email nor Phone Number selected');
			return;
		}

		if (!Auth || typeof Auth.verifyCurrentUserAttribute !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}

		Auth.verifyCurrentUserAttribute(checkedValue)
			.then((data) => {
				logger.debug(data);
				this.setState({ verifyAttr: checkedValue });
			})
			.catch((err) => this.error(err));
	}

	submit() {
		const attr = this.state.verifyAttr;
		const { code } = this.inputs;
		if (!Auth || typeof Auth.verifyCurrentUserAttributeSubmit !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifyCurrentUserAttributeSubmit(attr, code)
			.then((data) => {
				logger.debug(data);
				this.changeState('signedIn', this.props.authData);
				this.setState({ verifyAttr: null });
			})
			.catch((err) => this.error(err));
	}

	verifyView() {
		const user = this.props.authData;
		if (!user) {
			logger.debug('no user for verify');
			return null;
		}
		const { unverified } = user;
		if (!unverified) {
			logger.debug('no unverified on user');
			return null;
		}
		const { email, phone_number } = unverified;
		const theme = this.props.theme || AmplifyTheme;
		return (
			<div>
				{email ? (
					<RadioRow
						placeholder={I18n.get('Email')}
						theme={theme}
						key="email"
						name="contact"
						value="email"
						onChange={this.handleInputChange}
					/>
				) : null}
				{phone_number ? (
					<RadioRow
						placeholder={I18n.get('Phone Number')}
						theme={theme}
						key="phone_number"
						name="contact"
						value="phone_number"
						onChange={this.handleInputChange}
					/>
				) : null}
			</div>
		);
	}

	submitView() {
		const theme = this.props.theme || AmplifyTheme;
		return (
			<div>
				<Input
					placeholder={I18n.get('Code')}
					theme={theme}
					key="code"
					name="code"
					autoComplete="off"
					onChange={this.handleInputChange}
				/>
			</div>
		);
	}

	showComponent(theme) {
		const { authData, hide } = this.props;
		if (hide && hide.includes(VerifyContact)) {
			return null;
		}

		return (
			<FormSection theme={theme} data-test={auth.verifyContact.section}>
				<SectionHeader
					theme={theme}
					data-test={auth.verifyContact.headerSection}
				>
					{I18n.get('Account recovery requires verified contact information')}
				</SectionHeader>
				<SectionBody theme={theme} data-test={auth.verifyContact.bodySection}>
					{this.state.verifyAttr ? this.submitView() : this.verifyView()}
				</SectionBody>
				<SectionFooter theme={theme}>
					<SectionFooterPrimaryContent theme={theme}>
						{this.state.verifyAttr ? (
							<Button
								theme={theme}
								onClick={this.submit}
								data-test={auth.verifyContact.submitButton}
							>
								{I18n.get('Submit')}
							</Button>
						) : (
							<Button
								theme={theme}
								onClick={this.verify}
								data-test={auth.verifyContact.verifyButton}
							>
								{I18n.get('Verify')}
							</Button>
						)}
					</SectionFooterPrimaryContent>
					<SectionFooterSecondaryContent theme={theme}>
						<Link
							theme={theme}
							onClick={() => this.changeState('signedIn', authData)}
							data-test={auth.verifyContact.skipLink}
						>
							{I18n.get('Skip')}
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
export default VerifyContact;
