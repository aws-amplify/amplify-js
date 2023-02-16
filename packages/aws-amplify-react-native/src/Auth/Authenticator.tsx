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

import React, { FC, ReactNode } from 'react';
import { Auth, Analytics, Logger, Hub } from 'aws-amplify';
import { isEmpty } from '@aws-amplify/core';

import AmplifyTheme, { AmplifyThemeType } from '../AmplifyTheme';
import AmplifyMessageMap from '../AmplifyMessageMap';
import { Container } from '../AmplifyUI';
import Loading from './Loading';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import VerifyContact from './VerifyContact';
import SignUp from './SignUp';
import ConfirmSignUp from './ConfirmSignUp';
import ForgotPassword from './ForgotPassword';
import RequireNewPassword from './RequireNewPassword';
import Greetings from './Greetings';
import { HubCapsule, OnStateChangeType, ISignUpConfig, UsernameAttributesType } from '../../types';

const logger = new Logger('Authenticator');

const EmptyContainer: FC<{}> = ({ children }) => <React.Fragment>{children}</React.Fragment>;

class AuthDecorator {
	onStateChange: (state: string) => void;

	constructor(onStateChange: OnStateChangeType) {
		this.onStateChange = onStateChange;
	}

	signIn(username: string, password: string) {
		const that = this;
		return Auth.signIn(username, password).then((data) => {
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

interface IAuthenticatorProps {
	authData?: any;
	authState?: string;
	container?: ReactNode;
	errorMessage?: string;
	hideDefault?: boolean;
	signUpConfig?: ISignUpConfig;
	usernameAttributes?: UsernameAttributesType;
	onStateChange?: OnStateChangeType;
	theme?: AmplifyThemeType;
}

interface IAuthenticatorState {
	authData?: any;
	authState: string;
	error?: string;
}

export default class Authenticator extends React.Component<IAuthenticatorProps, IAuthenticatorState> {
	_initialAuthState: string;
	_isMounted: boolean;

	constructor(props: IAuthenticatorProps) {
		super(props);
		this._initialAuthState = this.props.authState || 'signIn';
		this.state = {
			authState: props.authState || 'loading',
			authData: props.authData,
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

	onHubCapsule(capsule: HubCapsule) {
		const {
			payload: { event, data },
		} = capsule;
		switch (event) {
			case 'cognitoHostedUI':
			case 'signIn':
				this.checkContact(data);
				break;
			case 'cognitoHostedUI_failure':
			case 'parsingUrl_failure':
			case 'signOut':
			case 'customGreetingSignOut':
				return this.handleStateChange('signIn', null);
		}
	}

	handleStateChange(state: string, data?: any) {
		if (state === undefined) return logger.info('Auth state cannot be undefined');

		logger.info('Inside handleStateChange method current authState:', this.state.authState);

		const nextAuthState = state === 'signedOut' ? this._initialAuthState : state;
		const nextAuthData = data !== undefined ? data : this.state.authData;

		if (this._isMounted) {
			this.setState({
				authState: nextAuthState,
				authData: nextAuthData,
				error: null,
			});
			logger.log('Auth Data was set:', nextAuthData);
			logger.info(`authState has been updated to ${nextAuthState}`);
		}

		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}

		// @ts-ignore
		if (Analytics._config && Object.entries(Analytics._config).length > 0) {
			switch (state) {
				case 'signedIn':
					Analytics.record('_userauth.sign_in');
					break;
				case 'signedUp':
					Analytics.record('_userauth.sign_up');
					break;
			}
		}
	}

	async checkContact(user: any) {
		try {
			const data = await Auth.verifiedContact(user);
			logger.debug('verified user attributes', data);
			if (!isEmpty(data.verified)) {
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
		Auth.currentAuthenticatedUser()
			.then((user) => {
				if (!this._isMounted) return;
				if (user) {
					this.checkContact(user);
				} else {
					if (statesJumpToSignIn.includes(authState)) {
						this.handleStateChange(this._initialAuthState, null);
					}
				}
			})
			.catch((err) => {
				if (!this._isMounted) return;
				logger.debug(err);
				if (statesJumpToSignIn.includes(authState)) {
					Auth.signOut()
						.then(() => {
							this.handleStateChange(this._initialAuthState, null);
						})
						.catch((err) => logger.warn('Failed to sign out', err));
				}
			});
	}

	render() {
		const { authState, authData } = this.state;
		const theme = this.props.theme || AmplifyTheme;
		const messageMap = this.props.errorMessage || AmplifyMessageMap;
		// If container prop is undefined, default to AWS Amplify UI Container (SafeAreaView)
		// otherwise if truthy, use the supplied render prop
		// otherwise if falsey, use EmptyContainer
		const ContainerWrapper: any =
			this.props.container === undefined ? Container : this.props.container || EmptyContainer;

		const { hideDefault, signUpConfig, usernameAttributes = 'username' } = this.props;
		const props_children: any = this.props.children || [];
		const default_children = [
			<Loading />,
			<SignIn />,
			<ConfirmSignIn />,
			<VerifyContact />,
			<SignUp signUpConfig={signUpConfig} />,
			<ConfirmSignUp />,
			<ForgotPassword />,
			<RequireNewPassword />,
			<Greetings />,
		];
		const children = (hideDefault ? [] : default_children).concat(props_children).map((child, index) => {
			return React.cloneElement(child, {
				key: 'auth_piece_' + index,
				theme: theme,
				messageMap: messageMap,
				authState: authState,
				authData: authData,
				onStateChange: this.handleStateChange,
				Auth: new AuthDecorator(this.handleStateChange),
				usernameAttributes,
			});
		});
		return <ContainerWrapper theme={theme}>{children}</ContainerWrapper>;
	}
}
