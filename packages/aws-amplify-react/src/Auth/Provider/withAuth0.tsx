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

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import AmplifyTheme from '../../Amplify-UI/Amplify-UI-Theme';
// import auth0 from 'auth0-js';
import { auth0SignInButton } from '@aws-amplify/ui';
import {
	SignInButton,
	SignInButtonIcon,
	SignInButtonContent,
} from '../../Amplify-UI/Amplify-UI-Components-React';
import { Constants } from '../common/constants';

const logger = new Logger('withAuth0');

export function withAuth0(Comp, options?) {
	return class extends React.Component<any, any> {
		public _auth0;

		constructor(props: any) {
			super(props);
			this._auth0 = null;

			this.initialize = this.initialize.bind(this);
			this.signIn = this.signIn.bind(this);
			this.signOut = this.signOut.bind(this);
		}

		componentDidMount() {
			if (!window.auth0) {
				this.createScript();
			} else {
				this.initialize();
			}
		}

		createScript() {
			const script = document.createElement('script');
			script.src = 'https://cdn.auth0.com/js/auth0/9.8.1/auth0.min.js';
			script.async = true;
			script.onload = this.initialize;
			document.body.appendChild(script);
		}

		initialize() {
			// @ts-ignore
			const { oauth = {} } = Auth.configure();
			// @ts-ignore
			const config = this.props.auth0 || options || oauth.auth0;
			const { onError, onStateChange, authState } = this.props;
			if (!config) {
				logger.debug('Auth0 is not configured');
				return;
			}

			logger.debug('withAuth0 configuration', config);

			if (!this._auth0) {
				this._auth0 = new window['auth0'].WebAuth(config);
				window.auth0_client = this._auth0;
			}

			if (authState !== 'signedIn') {
				this._auth0.parseHash((err, authResult) => {
					if (err || !authResult) {
						logger.debug('Failed to parse the url for Auth0', err);
						return;
					}
					const payload = {
						provider: Constants.AUTH0,
						opts: {
							returnTo: config.returnTo,
							clientID: config.clientID,
							federated: config.federated,
						},
					};

					try {
						localStorage.setItem(
							Constants.AUTH_SOURCE_KEY,
							JSON.stringify(payload)
						);
					} catch (e) {
						logger.debug('Failed to cache auth source into localStorage', e);
					}

					this._auth0.client.userInfo(authResult.accessToken, (err, user) => {
						let username = undefined;
						let email = undefined;
						let picture = undefined;
						if (err) {
							logger.debug('Failed to get the user info', err);
						} else {
							username = user.name;
							email = user.email;
							picture = user.picture;
						}

						Auth.federatedSignIn(
							config.domain,
							{
								token: authResult.idToken,
								expires_at: authResult.expiresIn * 1000 + new Date().getTime(),
							},
							{
								name: username,
								email,
								picture,
							}
						)
							.then(() => {
								if (onStateChange) {
									Auth.currentAuthenticatedUser().then(user => {
										onStateChange('signedIn', user);
									});
								}
							})
							.catch(e => {
								logger.debug('Failed to get the aws credentials', e);
								if (onError) onError(e);
							});
					});
				});
			}
		}

		async signIn() {
			if (this._auth0) this._auth0.authorize();
			else {
				throw new Error('the auth0 client is not configured');
			}
		}

		signOut(opts = {}) {
			const auth0 = window.auth0_client;
			// @ts-ignore
			const { returnTo, clientID, federated } = opts;
			if (!auth0) {
				logger.debug('auth0 sdk undefined');
				return Promise.resolve();
			}
			auth0.logout({
				returnTo,
				clientID,
				federated,
			});
		}

		render(): React.ReactNode {
			return (
				<Comp
					{...this.props}
					auth0={this._auth0}
					auth0SignIn={this.signIn}
					auth0SignOut={this.signOut}
				/>
			);
		}
	};
}

const Button = props => (
	<SignInButton
		id={auth0SignInButton}
		onClick={props.auth0SignIn}
		theme={props.theme || AmplifyTheme}
		variant={'auth0SignInButton'}
	>
		<SignInButtonIcon theme={props.theme || AmplifyTheme}>
			<svg
				id="artwork"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 193.7 216.6"
			>
				<path
					id="NEW"
					className="st0"
					d="M189,66.9L167.2,0H96.8l21.8,66.9H189z M96.8,0H26.5L4.8,66.9h70.4L96.8,0z M4.8,66.9L4.8,66.9	c-13,39.9,1.2,83.6,35.2,108.3l21.7-66.9L4.8,66.9z M189,66.9L189,66.9l-57,41.4l21.7,66.9l0,0C187.7,150.6,201.9,106.8,189,66.9	L189,66.9z M39.9,175.2L39.9,175.2l56.9,41.4l56.9-41.4l-56.9-41.4L39.9,175.2z"
				/>
			</svg>
		</SignInButtonIcon>
		<SignInButtonContent theme={props.theme || AmplifyTheme}>
			{props.label || 'Sign In with Auth0'}
		</SignInButtonContent>
	</SignInButton>
);

export const Auth0Button = withAuth0(Button);

/**
 * @deprecated use named import
 */
export default withAuth0;
