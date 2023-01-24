/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { Linking } from 'react-native';

import { Logger, Hub } from '@aws-amplify/core';
import {
	Auth,
	CognitoHostedUIIdentityProvider,
} from '@aws-amplify/auth';

const logger = new Logger('withOAuth');

interface IOAuthProps {
	loading?: boolean;
	oAuthUser?: any;
	oAuthError?: any;
	// TODO: Type these functions
	hostedUISignIn?: Function;
	facebookSignIn?: Function;
	amazonSignIn?: Function;
	googleSignIn?: Function;
	customProviderSignIn?: Function;
	signOut?: Function;
}

interface IWithOAuthProps {
	oauth_config?: any;
}

interface IWithOAuthState {
	error?: string;
	loading: boolean;
	user?: any;
}

export default function withOAuth<Props extends object>(
	Comp: React.ComponentType<IWithOAuthProps & IOAuthProps>
) {
	let listeners = [];

	return class WithOAuth extends React.Component<
		Props & IWithOAuthProps,
		IWithOAuthState
	> {
		_isMounted: boolean;
		urlOpener: any;

		constructor(props: Props & IWithOAuthProps) {
			super(props);
			this._isMounted = false;
			const config = this._getOAuthConfig();

			const { urlOpener = defaultUrlOpener } = config;

			this.urlOpener = urlOpener;

			this.hostedUISignIn = this.hostedUISignIn.bind(this);
			this.signOut = this.signOut.bind(this);
			this.urlOpener = this.urlOpener.bind(this);

			this.state = {
				user: null,
				error: null,
				loading: false,
			};

			listeners.forEach(listener => Hub.remove('auth', listener));
			listeners = [this];
			this.onHubCapsule = this.onHubCapsule.bind(this);
			Hub.listen('auth', this.onHubCapsule);
		}

		componentDidMount() {
			this._isMounted = true;
			this.setState({ loading: true }, () => {
				Auth.currentAuthenticatedUser()
					.then(user => {
						this.setState({ user, loading: false });
					})
					.catch(error => {
						logger.debug(error);
						this.setState({ user: null, loading: false });
					});
			});
		}
		componentWillUnmount() {
			this._isMounted = false;
			return;
		}
		onHubCapsule(capsule) {
			// The Auth module will emit events when user signs in, signs out, etc
			if (!this._isMounted) return;
			const { channel, payload } = capsule;

			if (channel === 'auth') {
				switch (payload.event) {
					case 'signIn':
					case 'cognitoHostedUI': {
						Auth.currentAuthenticatedUser().then(user => {
							logger.debug('signed in');
							this.setState({
								user,
								error: null,
								loading: false,
							});
						});
						break;
					}
					case 'signOut': {
						logger.debug('signed out');
						this.setState({
							user: null,
							error: null,
							loading: false,
						});
						break;
					}
					case 'signIn_failure':
					case 'cognitoHostedUI_failure': {
						logger.debug('not signed in');
						this.setState({
							user: null,
							error: decodeURIComponent(payload.data),
							loading: false,
						});
						break;
					}
					default:
						break;
				}
			}
		}

		_getOAuthConfig() {
			if (!Auth || typeof Auth.configure !== 'function') {
				throw new Error(
					'No Auth module found, please ensure @aws-amplify/auth is imported'
				);
			}

			// @ts-ignore
			const { oauth = undefined } = Auth.configure();

			// to keep backward compatibility
			const cognitoHostedUIConfig =
				// @ts-ignore
				oauth && (oauth.domain ? oauth : oauth.awsCognito);
			const config = this.props.oauth_config || cognitoHostedUIConfig;

			return config;
		}

		hostedUISignIn(provider) {
			this.setState({ loading: true }, () =>
				Auth.federatedSignIn({ provider })
			);
		}

		signOut() {
			return Auth.signOut().catch(error => logger.warn(error));
		}

		render() {
			const { user: oAuthUser, error: oAuthError, loading } = this.state;
			const { oauth_config: _, ...otherProps } = this.props;

			const oAuthProps: IOAuthProps = {
				loading,
				oAuthUser,
				oAuthError,
				hostedUISignIn: this.hostedUISignIn.bind(
					this,
					CognitoHostedUIIdentityProvider.Cognito
				),
				facebookSignIn: this.hostedUISignIn.bind(
					this,
					CognitoHostedUIIdentityProvider.Facebook
				),
				amazonSignIn: this.hostedUISignIn.bind(
					this,
					CognitoHostedUIIdentityProvider.Amazon
				),
				googleSignIn: this.hostedUISignIn.bind(
					this,
					CognitoHostedUIIdentityProvider.Google
				),
				customProviderSignIn: provider => this.hostedUISignIn(provider),
				signOut: this.signOut,
			};

			return <Comp {...oAuthProps} {...otherProps} />;
		}
	};
}

const defaultUrlOpener = (url, redirectUrl) => {
	logger.debug(`opening url: ${url}, redirectUrl: ${redirectUrl}`);

	return Linking.openURL(url);
};
