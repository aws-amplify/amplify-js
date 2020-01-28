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
import { SafeAreaView } from 'react-native';
import { Auth, Analytics, Logger, Hub, JS } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import AmplifyMessageMap from '../AmplifyMessageMap';
import Loading from './Loading';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import VerifyContact from './VerifyContact';
import SignUp from './SignUp';
import ConfirmSignUp from './ConfirmSignUp';
import ForgotPassword from './ForgotPassword';
import RequireNewPassword from './RequireNewPassword';
import Greetings from './Greetings';

const logger = new Logger('Authenticator');

class AuthDecorator {
	constructor(onStateChange) {
		this.onStateChange = onStateChange;
	}

	signIn(username, password) {
		const that = this;
		return Auth.signIn(username, password).then(data => {
			that.onStateChange('signedIn');
			return data;
		});
	}

	signOut() {
		const that = this;
		return Auth.signOut().then(() => {
			that.onStateChange('signedOut');
		});
	}
}

export default class Authenticator extends React.Component {
	constructor(props) {
		super(props);
		this._initialAuthState = this.props.authState || 'signIn';
		this.state = {
			authState: props.authState || 'loading',
			authData: props.authData
		};

		this.handleStateChange = this.handleStateChange.bind(this);
		this.checkUser = this.checkUser.bind(this);
		this.onHubCapsule = this.onHubCapsule.bind(this);
		this.checkContact = this.checkContact.bind(this);

		Hub.listen('auth', this.onHubCapsule);
	}

	componentDidMount() {
		this._isMounted = true;
		this.checkUser();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	onHubCapsule(capsule) {
		const { channel, payload, source } = capsule;
		if (channel === 'auth') {
			this.checkUser();
		}
	}

	handleStateChange(state, data) {
		logger.debug('authenticator state change ' + state);
		if (!this._isMounted) return;
		if (state === this.state.authState) {
			return;
		}

		if (state === 'signedOut') {
			state = 'signIn';
		}
		this.setState({ authState: state, authData: data, error: null });
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}

		switch (state) {
			case 'signedIn':
				Analytics.record('_userauth.sign_in');
				break;
			case 'signedUp':
				Analytics.record('_userauth.sign_up');
				break;
		}
	}

	async checkContact(user) {
		try {
			const data = await Auth.verifiedContact(user);
			logger.debug('verified user attributes', data);
			if (!JS.isEmpty(data.verified)) {
				this.handleStateChange('signedIn', user);
			} else {
				user = Object.assign(user, data);
				this.handleStateChange('verifyContact', user);
			}
		} catch (e) {
			logger.warn('Failed to verify contact', e);
			this.handleStateChange('signedIn', user);
		}
	}

	checkUser() {
		const { authState } = this.state;
		const statesJumpToSignIn = ['signedIn', 'signedOut', 'loading'];
		Auth.currentAuthenticatedUser().then(user => {
			if (!this._isMounted) return;
			if (user) {
				this.checkContact(user);
			} else {
				if (statesJumpToSignIn.includes(authState)) {
					this.handleStateChange(this._initialAuthState, null);
				}
			}
		}).catch(err => {
			if (!this._isMounted) return;
			logger.debug(err);
			if (statesJumpToSignIn.includes(authState)) {
				Auth.signOut().then(() => {
					this.handleStateChange(this._initialAuthState, null);
				}).catch(err => this.error(err));
			}
		});
	}

	render() {
		const { authState, authData } = this.state;
		const theme = this.props.theme || AmplifyTheme;
		const messageMap = this.props.errorMessage || AmplifyMessageMap;

		const { hideDefault, signUpConfig, usernameAttributes } = this.props;
		const props_children = this.props.children || [];
		const default_children = [React.createElement(Loading, null), React.createElement(SignIn, null), React.createElement(ConfirmSignIn, null), React.createElement(VerifyContact, null), React.createElement(SignUp, { signUpConfig: signUpConfig }), React.createElement(ConfirmSignUp, null), React.createElement(ForgotPassword, null), React.createElement(RequireNewPassword, null), React.createElement(Greetings, null)];
		const children = (hideDefault ? [] : default_children).concat(props_children).map((child, index) => {
			return React.cloneElement(child, {
				key: 'auth_piece_' + index,
				theme: theme,
				messageMap: messageMap,
				authState: authState,
				authData: authData,
				onStateChange: this.handleStateChange,
				Auth: new AuthDecorator(this.handleStateChange),
				usernameAttributes
			});
		});
		return React.createElement(
			SafeAreaView,
			{ style: theme.container },
			children
		);
	}
}