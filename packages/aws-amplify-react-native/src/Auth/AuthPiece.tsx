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
import { Keyboard } from 'react-native';
import { Auth, Logger, JS, I18n } from 'aws-amplify';

import AmplifyTheme, { AmplifyThemeType } from '../AmplifyTheme';
import AmplifyMessageMap from '../AmplifyMessageMap';
import { FormField, PhoneField } from '../AmplifyUI';
import TEST_ID from '../AmplifyTestIDs';
import { OnStateChangeType, UsernameAttributesType } from '../../types';
import { setTestId } from '../Utils';

const logger = new Logger('AuthPiece');

const labelMap = {
	email: 'Email',
	phone_number: 'Phone Number',
	username: 'Username',
};

export interface IAuthPieceProps {
	authData?: any;
	authState?: string;
	errorMessage?: string;
	messageMap?: any;
	onStateChange?: OnStateChangeType;
	theme?: AmplifyThemeType;
	track?: () => void;
	usernameAttributes?: UsernameAttributesType;
}

export interface IAuthPieceState {
	email?: string;
	error?: string | null;
	phone_number?: string;
	username?: string;
}

export default class AuthPiece<Props extends IAuthPieceProps, State extends IAuthPieceState> extends React.Component<
	Props,
	State
> {
	_isHidden: boolean;
	_validAuthStates: String[];

	constructor(props) {
		super(props);

		this._isHidden = true;
		this._validAuthStates = [];
		this.changeState = this.changeState.bind(this);
		this.error = this.error.bind(this);

		this.getUsernameFromInput = this.getUsernameFromInput.bind(this);
		this.renderUsernameField = this.renderUsernameField.bind(this);
	}

	getUsernameFromInput() {
		const { usernameAttributes = 'username' } = this.props;
		switch (usernameAttributes) {
			case 'email':
				return this.state.email;
			case 'phone_number':
				return this.state.phone_number;
			default:
				return this.state.username;
		}
	}

	renderUsernameField(theme: AmplifyThemeType) {
		const value = this.getUsernameFromInput();
		const { usernameAttributes = [] } = this.props;
		if (usernameAttributes === 'email') {
			return (
				<FormField
					theme={theme}
					onChangeText={(text) => this.setState({ email: text })}
					label={I18n.get('Email')}
					placeholder={I18n.get('Enter your email')}
					required={true}
					{...setTestId(TEST_ID.AUTH.EMAIL_INPUT)}
					value={value}
				/>
			);
		} else if (usernameAttributes === 'phone_number') {
			return (
				<PhoneField
					theme={theme}
					key={'phone_number'}
					onChangeText={(text) => this.setState({ phone_number: text })}
					label={I18n.get('Phone Number')}
					placeholder={I18n.get('Enter your phone number')}
					keyboardType="phone-pad"
					required={true}
					{...setTestId(TEST_ID.AUTH.PHONE_INPUT)}
					value={value}
				/>
			);
		} else {
			return (
				<FormField
					theme={theme}
					onChangeText={(text) => this.setState({ username: text })}
					label={I18n.get(this.getUsernameLabel())}
					placeholder={I18n.get('Enter your username')}
					required={true}
					{...setTestId(TEST_ID.AUTH.USERNAME_INPUT)}
					value={value}
				/>
			);
		}
	}

	getUsernameLabel() {
		const { usernameAttributes = 'username' } = this.props;
		return labelMap[usernameAttributes] || usernameAttributes;
	}

	changeState(state: string, data?: any) {
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}
	}

	checkContact(user: any) {
		Auth.verifiedContact(user).then((data) => {
			logger.debug('verified user attributes', data);
			if (!JS.isEmpty(data.verified)) {
				this.changeState('signedIn', user);
			} else {
				user = Object.assign(user, data);
				this.changeState('verifyContact', user);
			}
		});
	}

	error(err: any) {
		logger.debug(err);

		let msg = '';
		if (typeof err === 'string') {
			msg = err;
		} else if (err.message) {
			msg = err.message;
		} else {
			msg = JSON.stringify(err);
		}

		const map = this.props.errorMessage || this.props.messageMap || AmplifyMessageMap;
		msg = typeof map === 'string' ? map : map(msg);
		this.setState({ error: msg });
		Keyboard.dismiss();
	}

	render() {
		if (!this._validAuthStates.includes(this.props.authState as string)) {
			this._isHidden = true;
			return null;
		}

		if (this._isHidden) {
			const { track } = this.props;
			if (track) track();
		}
		this._isHidden = false;

		return this.showComponent(this.props.theme || AmplifyTheme);
	}

	showComponent(theme): any {
		throw "You must implement showComponent(theme) and don't forget to set this._validAuthStates.";
	}
}
