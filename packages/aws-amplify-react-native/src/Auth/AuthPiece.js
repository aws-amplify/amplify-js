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

import { Auth, Logger, JS, I18n } from 'aws-amplify';

import AmplifyTheme from '../AmplifyTheme';
import AmplifyMessageMap from '../AmplifyMessageMap';
import { FormField, PhoneField } from '../AmplifyUI';

const logger = new Logger('AuthPiece');

const labelMap = {
	email: 'Email',
	phone_number: 'Phone Number',
	username: 'Username',
};

export default class AuthPiece extends React.Component {
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

	renderUsernameField(theme) {
		const { usernameAttributes = [] } = this.props;
		if (usernameAttributes === 'email') {
			return (
				<FormField
					theme={theme}
					onChangeText={text => this.setState({ email: text })}
					label={I18n.get('Email')}
					placeholder={I18n.get('Enter your email')}
					required={true}
				/>
			);
		} else if (usernameAttributes === 'phone_number') {
			return (
				<PhoneField
					theme={theme}
					key={'phone_number'}
					onChangeText={text => this.setState({ phone_number: text })}
					label={I18n.get('Phone Number')}
					placeholder={I18n.get('Enter your phone number')}
					keyboardType="phone-pad"
					required={true}
				/>
			);
		} else {
			return (
				<FormField
					theme={theme}
					onChangeText={text => this.setState({ username: text })}
					label={I18n.get(this.getUsernameLabel())}
					placeholder={I18n.get('Enter your username')}
					required={true}
				/>
			);
		}
	}

	getUsernameLabel() {
		const { usernameAttributes = 'username' } = this.props;
		return labelMap[usernameAttributes] || usernameAttributes;
	}

	changeState(state, data) {
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}
	}

	checkContact(user) {
		Auth.verifiedContact(user).then(data => {
			logger.debug('verified user attributes', data);
			if (!JS.isEmpty(data.verified)) {
				this.changeState('signedIn', user);
			} else {
				user = Object.assign(user, data);
				this.changeState('verifyContact', user);
			}
		});
	}

	error(err) {
		logger.debug(err);

		let msg = '';
		if (typeof err === 'string') {
			msg = err;
		} else if (err.message) {
			msg = err.message;
		} else {
			msg = JSON.stringify(err);
		}

		const map =
			this.props.errorMessage || this.props.messageMap || AmplifyMessageMap;
		msg = typeof map === 'string' ? map : map(msg);
		this.setState({ error: msg });
	}

	render() {
		if (!this._validAuthStates.includes(this.props.authState)) {
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

	showComponent(theme) {
		throw "You must implement showComponent(theme) and don't forget to set this._validAuthStates.";
	}
}
