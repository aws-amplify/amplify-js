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

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
	InputLabel,
	Input,
	Button,
	Toast,
} from '../Amplify-UI/Amplify-UI-Components-React';

import { totpQrcode } from '@aws-amplify/ui';

import QRCode from 'qrcode.react';

const logger = new Logger('TOTPSetupComp');

export interface ITOTPSetupCompProps {
	authData?: any;
	onTOTPEvent?: (event: any, data: any, user: any) => void;
	theme?: any;
}

export interface ITOTPSetupCompState {
	code: string | null;
	setupMessage: string | null;
}

export class TOTPSetupComp extends React.Component<
	ITOTPSetupCompProps,
	ITOTPSetupCompState
> {
	public inputs: any;

	constructor(props) {
		super(props);

		this.setup = this.setup.bind(this);
		this.showSecretCode = this.showSecretCode.bind(this);
		this.verifyTotpToken = this.verifyTotpToken.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.triggerTOTPEvent = this.triggerTOTPEvent.bind(this);

		this.state = {
			code: null,
			setupMessage: null,
		};
	}

	componentDidMount() {
		this.setup();
	}

	triggerTOTPEvent(event, data, user) {
		if (this.props.onTOTPEvent) {
			this.props.onTOTPEvent(event, data, user);
		}
	}

	handleInputChange(evt) {
		this.setState({ setupMessage: null });
		this.inputs = {};
		const { name, value, type, checked } = evt.target;
		// @ts-ignore
		const check_type = ['radio', 'checkbox'].includes(type);
		this.inputs[name] = check_type ? checked : value;
	}

	setup() {
		this.setState({ setupMessage: null });
		const user = this.props.authData;
		const issuer = encodeURI(I18n.get('AWSCognito'));
		if (!Auth || typeof Auth.setupTOTP !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}

		Auth.setupTOTP(user)
			.then(data => {
				logger.debug('secret key', data);
				const code =
					'otpauth://totp/' +
					issuer +
					':' +
					user.username +
					'?secret=' +
					data +
					'&issuer=' +
					issuer;
				this.setState({ code });
			})
			.catch(err => logger.debug('totp setup failed', err));
	}

	verifyTotpToken() {
		if (!this.inputs) {
			logger.debug('no input');
			return;
		}
		const user = this.props.authData;
		const { totpCode } = this.inputs;
		if (
			!Auth ||
			typeof Auth.verifyTotpToken !== 'function' ||
			typeof Auth.setPreferredMFA !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		return Auth.verifyTotpToken(user, totpCode)
			.then(() => {
				// set it to preferred mfa
				return Auth.setPreferredMFA(user, 'TOTP')
					.then(() => {
						this.setState({ setupMessage: 'Setup TOTP successfully!' });
						logger.debug('set up totp success!');
						this.triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
					})
					.catch(err => {
						this.setState({ setupMessage: 'Setup TOTP failed!' });
						logger.error(err);
					});
			})
			.catch(err => {
				this.setState({ setupMessage: 'Setup TOTP failed!' });
				logger.error(err);
			});
	}

	showSecretCode(code, theme) {
		if (!code) return null;
		return (
			<div>
				<div className={totpQrcode}>
					<QRCode value={code} />
				</div>
				<InputLabel theme={theme}>
					{I18n.get('Enter Security Code:')}
				</InputLabel>
				<Input
					autoFocus
					theme={theme}
					key="totpCode"
					name="totpCode"
					onChange={this.handleInputChange}
				/>
			</div>
		);
	}

	render() {
		const theme = this.props.theme ? this.props.theme : AmplifyTheme;
		const code = this.state.code;

		return (
			<FormSection theme={theme}>
				{this.state.setupMessage && (
					<Toast>{I18n.get(this.state.setupMessage)}</Toast>
				)}
				<SectionHeader theme={theme}>
					{I18n.get('Scan then enter verification code')}
				</SectionHeader>
				<SectionBody theme={theme}>
					{this.showSecretCode(code, theme)}
					{this.state.setupMessage && I18n.get(this.state.setupMessage)}
				</SectionBody>

				<SectionFooter theme={theme}>
					<Button
						theme={theme}
						onClick={this.verifyTotpToken}
						style={{ width: '100%' }}
					>
						{I18n.get('Verify Security Token')}
					</Button>
				</SectionFooter>
			</FormSection>
		);
	}
}

/**
 * @deprecated use named import
 */
export default TOTPSetupComp;
