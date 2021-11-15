/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import {
	Amplify,
	I18n,
	ConsoleLogger as Logger,
	Hub,
	isEmpty,
} from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { Greetings } from './Greetings';
import { SignIn } from './SignIn';
import { ConfirmSignIn } from './ConfirmSignIn';
import { RequireNewPassword } from './RequireNewPassword';
import { SignUp } from './SignUp';
import { Loading } from './Loading';
import { ConfirmSignUp } from './ConfirmSignUp';
import { VerifyContact } from './VerifyContact';
import { ForgotPassword } from './ForgotPassword';
import { TOTPSetup } from './TOTPSetup';
import { Constants } from './common/constants';

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import { AmplifyMessageMap } from '../AmplifyMessageMap';

import { Container, Toast } from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
import { UsernameAttributes } from './common/types';

const logger = new Logger('Authenticator');
const AUTHENTICATOR_AUTHSTATE = 'amplify-authenticator-authState';

export const EmptyContainer = ({ children }) => <>{children}</>;

export interface IAuthenticatorProps {
	amplifyConfig?: any;
	authData?: any;
	authState?: string;
	container?: any;
	errorMessage?: (message: string) => string;
	federated?: any;
	hide?: any[];
	hideDefault?: boolean;
	onStateChange?: (authState: string, data?) => void;
	signUpConfig?: any;
	theme?: any;
	usernameAttributes?: UsernameAttributes;
}

export interface IAuthenticatorState {
	authData?;
	authState: string;
	error?: string;
	showToast?: boolean;
}

export class Authenticator extends React.Component<
	IAuthenticatorProps,
	IAuthenticatorState
> {
	public _initialAuthState: string;
	public _isMounted: boolean;

	constructor(props) {
		super(props);

		this.handleStateChange = this.handleStateChange.bind(this);
		this.handleAuthEvent = this.handleAuthEvent.bind(this);
		this.onHubCapsule = this.onHubCapsule.bind(this);

		this._initialAuthState = this.props.authState || 'signIn';
		this.state = { authState: 'loading' };
		Hub.listen('auth', this.onHubCapsule);
	}

	componentDidMount() {
		const config = this.props.amplifyConfig;
		if (config) {
			Amplify.configure(config);
		}
		this._isMounted = true;
		// The workaround for Cognito Hosted UI:
		// Don't check the user immediately if redirected back from Hosted UI as
		// it might take some time for credentials to be available, instead
		// wait for the hub event sent from Auth module. This item in the
		// localStorage is a mark to indicate whether the app is just redirected
		// back from Hosted UI or not and is set in Auth:handleAuthResponse.
		const byHostedUI = localStorage.getItem(
			Constants.REDIRECTED_FROM_HOSTED_UI
		);
		localStorage.removeItem(Constants.REDIRECTED_FROM_HOSTED_UI);
		if (byHostedUI !== 'true') this.checkUser();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}
	checkUser() {
		if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		return Auth.currentAuthenticatedUser()
			.then((user) => {
				if (!this._isMounted) {
					return;
				}
				this.handleStateChange('signedIn', user);
			})
			.catch((err) => {
				if (!this._isMounted) {
					return;
				}
				let cachedAuthState = null;
				try {
					cachedAuthState = localStorage.getItem(AUTHENTICATOR_AUTHSTATE);
				} catch (e) {
					logger.debug('Failed to get the auth state from local storage', e);
				}
				const promise =
					cachedAuthState === 'signedIn' ? Auth.signOut() : Promise.resolve();
				promise
					.then(() => this.handleStateChange(this._initialAuthState))
					.catch((e) => {
						logger.debug('Failed to sign out', e);
					});
			});
	}

	checkContact(user, changeState) {
		if (!Auth || typeof Auth.verifiedContact !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.verifiedContact(user).then((data) => {
			if (!isEmpty(data.verified)) {
				changeState('signedIn', user);
			} else {
				user = Object.assign(user, data);
				changeState('verifyContact', user);
			}
		});
	}

	onHubCapsule(capsule) {
		const { channel, payload, source } = capsule;
		if (channel === 'auth') {
			switch (payload.event) {
				case 'cognitoHostedUI':
				case 'signIn':
					this.checkContact(payload.data, this.handleStateChange);
					break;
				case 'cognitoHostedUI_failure':
					this.handleStateChange('signIn', null);
					break;
				case 'parsingUrl_failure':
					this.handleStateChange('signIn', null);
					break;
				case 'signOut':
					this.handleStateChange('signIn', null);
					break;
				case 'customGreetingSignOut':
					this.handleStateChange('signIn', null);
					break;
				default:
					break;
			}
		}
	}

	handleStateChange(state, data?) {
		logger.debug('authenticator state change ' + state, data);
		if (state === this.state.authState) {
			return;
		}

		if (state === 'signedOut') {
			state = 'signIn';
		}
		try {
			localStorage.setItem(AUTHENTICATOR_AUTHSTATE, state);
		} catch (e) {
			logger.debug('Failed to set the auth state into local storage', e);
		}

		if (this._isMounted) {
			this.setState({
				authState: state,
				authData: data,
				error: null,
				showToast: false,
			});
		}
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}
	}

	handleAuthEvent(state, event, showToast = true) {
		if (event.type === 'error') {
			const map = this.props.errorMessage || AmplifyMessageMap;
			const message = typeof map === 'string' ? map : map(event.data);
			this.setState({ error: message, showToast });
		}
	}

	render() {
		const { authState, authData } = this.state;
		const theme = this.props.theme || AmplifyTheme;
		const messageMap = this.props.errorMessage || AmplifyMessageMap;
		// If container prop is undefined, default to AWS Amplify UI Container
		// otherwise if truthy, use the supplied render prop
		// otherwise if falsey, use EmptyContainer
		const Wrapper =
			this.props.container === undefined
				? Container
				: this.props.container || EmptyContainer;

		let {
			hideDefault,
			hide = [],
			federated,
			signUpConfig,
			usernameAttributes,
		} = this.props;
		if (hideDefault) {
			hide = hide.concat([
				Greetings,
				SignIn,
				ConfirmSignIn,
				RequireNewPassword,
				SignUp,
				ConfirmSignUp,
				VerifyContact,
				ForgotPassword,
				TOTPSetup,
				Loading,
			]);
		}

		let props_children = [];
		if (typeof this.props.children === 'object') {
			if (Array.isArray(this.props.children)) {
				props_children = this.props.children;
			} else {
				props_children.push(this.props.children);
			}
		}

		const default_children = [
			<Greetings federated={federated} />,
			<SignIn federated={federated} />,
			<ConfirmSignIn />,
			<RequireNewPassword />,
			<SignUp signUpConfig={signUpConfig} />,
			<ConfirmSignUp />,
			<VerifyContact />,
			<ForgotPassword />,
			<TOTPSetup />,
			<Loading />,
		];

		const props_children_override = React.Children.map(
			props_children,
			(child) => child.props.override
		);
		hide = hide.filter(
			(component) => !props_children.find((child) => child.type === component)
		);

		const render_props_children = React.Children.map(
			props_children,
			(child, index) => {
				return React.cloneElement(child, {
					key: 'aws-amplify-authenticator-props-children-' + index,
					theme,
					messageMap,
					authState,
					authData,
					onStateChange: this.handleStateChange,
					onAuthEvent: this.handleAuthEvent,
					hide,
					override: props_children_override,
					usernameAttributes,
				});
			}
		);

		const render_default_children = hideDefault
			? []
			: React.Children.map(default_children, (child, index) => {
					return React.cloneElement(child, {
						key: 'aws-amplify-authenticator-default-children-' + index,
						theme,
						messageMap,
						authState,
						authData,
						onStateChange: this.handleStateChange,
						onAuthEvent: this.handleAuthEvent,
						hide,
						override: props_children_override,
						usernameAttributes,
					});
			  });

		const render_children = render_default_children.concat(
			render_props_children
		);
		const error = this.state.error;

		return (
			<Wrapper theme={theme}>
				{this.state.showToast && (
					<Toast
						theme={theme}
						onClose={() => this.setState({ showToast: false })}
						data-test={auth.signIn.signInError}
					>
						{I18n.get(error)}
					</Toast>
				)}
				{render_children}
			</Wrapper>
		);
	}
}

/**
 * @deprecated use named import
 */
export default Authenticator;
