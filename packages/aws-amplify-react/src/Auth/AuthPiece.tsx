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
import { I18n } from '@aws-amplify/core';
import {
	FormField,
	Input,
	InputLabel,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { UsernameAttributes } from './common/types';
import { PhoneField } from './PhoneField';
import { auth } from '../Amplify-UI/data-test-attributes';
import AmplifyTheme from '../AmplifyTheme';

const labelMap = {
	[UsernameAttributes.EMAIL]: 'Email',
	[UsernameAttributes.PHONE_NUMBER]: 'Phone Number',
	[UsernameAttributes.USERNAME]: 'Username',
};

export interface IAuthPieceProps {
	authData?: any;
	authState?: string;
	hide?: any;
	onAuthEvent?: any;
	onStateChange?: (state: string, data?) => void;
	track?: () => void;
	theme?: any;
	usernameAttributes?: UsernameAttributes;
}

export interface IAuthPieceState {
	username?: any;
	requestPending?: boolean;
}

export class AuthPiece<
	Props extends IAuthPieceProps,
	State extends IAuthPieceState
> extends React.Component<Props, State> {
	public _validAuthStates: string[];
	public _isHidden: boolean;
	public inputs: any;
	public phone_number: any;

	constructor(props) {
		super(props);

		this.inputs = {};

		this._isHidden = true;
		this._validAuthStates = [];
		this.phone_number = '';
		this.changeState = this.changeState.bind(this);
		this.error = this.error.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.renderUsernameField = this.renderUsernameField.bind(this);
		this.getUsernameFromInput = this.getUsernameFromInput.bind(this);
		this.onPhoneNumberChanged = this.onPhoneNumberChanged.bind(this);
	}

	componentDidMount() {
		if (window && window.location && window.location.search) {
			if (!this.props.authData || !this.props.authData.username) {
				const searchParams = new URLSearchParams(window.location.search);
				const username = searchParams
					? searchParams.get('username')
					: undefined;
				this.setState({ username });
			}
		}
	}

	getUsernameFromInput() {
		const { usernameAttributes = 'username' } = this.props;
		switch (usernameAttributes) {
			case UsernameAttributes.EMAIL:
				return this.inputs.email;
			case UsernameAttributes.PHONE_NUMBER:
				return this.phone_number;
			default:
				return this.inputs.username || this.state.username;
		}
	}

	onPhoneNumberChanged(phone_number) {
		this.phone_number = phone_number;
	}

	renderUsernameField(theme) {
		const { usernameAttributes = [] } = this.props;
		if (usernameAttributes === UsernameAttributes.EMAIL) {
			return (
				<FormField theme={theme}>
					<InputLabel theme={theme}>{I18n.get('Email')} *</InputLabel>
					<Input
						autoFocus
						placeholder={I18n.get('Enter your email')}
						theme={theme}
						key="email"
						name="email"
						type="email"
						onChange={this.handleInputChange}
						data-test={auth.genericAttrs.emailInput}
					/>
				</FormField>
			);
		} else if (usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
			return (
				<PhoneField theme={theme} onChangeText={this.onPhoneNumberChanged} />
			);
		} else {
			return (
				<FormField theme={theme}>
					<InputLabel theme={theme}>
						{I18n.get(this.getUsernameLabel())} *
					</InputLabel>
					<Input
						defaultValue={this.state.username}
						autoFocus
						placeholder={I18n.get('Enter your username')}
						theme={theme}
						key="username"
						name="username"
						onChange={this.handleInputChange}
						data-test={auth.genericAttrs.usernameInput}
					/>
				</FormField>
			);
		}
	}

	getUsernameLabel() {
		const { usernameAttributes = UsernameAttributes.USERNAME } = this.props;
		return (
			labelMap[usernameAttributes as UsernameAttributes] || usernameAttributes
		);
	}

	// extract username from authData
	usernameFromAuthData() {
		const { authData } = this.props;
		if (!authData) {
			return '';
		}

		let username = '';
		if (typeof authData === 'object') {
			// user object
			username = authData.user ? authData.user.username : authData.username;
		} else {
			username = authData; // username string
		}

		return username;
	}

	errorMessage(err) {
		if (typeof err === 'string') {
			return err;
		}
		return err.message ? err.message : JSON.stringify(err);
	}

	triggerAuthEvent(event) {
		const state = this.props.authState;
		if (this.props.onAuthEvent) {
			this.props.onAuthEvent(state, event);
		}
	}

	changeState(state, data?) {
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}

		this.triggerAuthEvent({
			type: 'stateChange',
			data: state,
		});
	}

	error(err) {
		this.triggerAuthEvent({
			type: 'error',
			data: this.errorMessage(err),
		});
	}

	handleInputChange(evt) {
		this.inputs = this.inputs || {};
		const { name, value, type, checked } = evt.target;
		const check_type = ['radio', 'checkbox'].includes(type);
		this.inputs[name] = check_type ? checked : value;
		this.inputs['checkedValue'] = check_type ? value : null;
	}

	render() {
		if (!this._validAuthStates.includes(this.props.authState)) {
			this._isHidden = true;
			this.inputs = {};
			return null;
		}

		if (this._isHidden) {
			this.inputs = {};
			const { track } = this.props;
			if (track) track();
		}
		this._isHidden = false;

		return this.showComponent(this.props.theme || AmplifyTheme);
	}

	showComponent(_theme?: any): React.ReactNode {
		throw 'You must implement showComponent(theme) and don\'t forget to set this._validAuthStates.';
	}
}

/**
 * @deprecated use named import
 */
export default AuthPiece;
