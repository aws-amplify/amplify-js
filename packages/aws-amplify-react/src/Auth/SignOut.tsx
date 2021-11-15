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
import { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

import { AuthPiece, IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { NavButton } from '../Amplify-UI/Amplify-UI-Components-React';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';

import { Constants } from './common/constants';

import { auth } from '../Amplify-UI/data-test-attributes';

const logger = new Logger('SignOut');

export interface ISignOutProps extends IAuthPieceProps {
	googleSignOut?: any;
	facebookSignOut?: any;
	amazonSignOut?: any;
	auth0SignOut?: any;
	stateFromStorage?: any;
}

export interface ISignOutState extends IAuthPieceState {
	authData?: any;
	authState?: any;
	stateFromStorage?: any;
}

export class SignOut extends AuthPiece<ISignOutProps, ISignOutState> {
	public _isMounted: boolean;

	constructor(props: ISignOutProps) {
		super(props);

		this.signOut = this.signOut.bind(this);
		this.onHubCapsule = this.onHubCapsule.bind(this);
		Hub.listen('auth', this.onHubCapsule);
		this.state = {};
	}

	componentDidMount() {
		this._isMounted = true;
		this.findState();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	findState() {
		if (!this.props.authState && !this.props.authData) {
			Auth.currentAuthenticatedUser()
				.then((user) => {
					this.setState({
						authState: 'signedIn',
						authData: user,
						stateFromStorage: true,
					});
				})
				.catch((err) => logger.error(err));
		} else if (this.props.stateFromStorage) {
			this.setState({
				stateFromStorage: true,
			});
		}
	}

	onHubCapsule(capsule) {
		if (this._isMounted) {
			const { channel, payload, source } = capsule;
			if (channel === 'auth' && payload.event === 'signIn') {
				this.setState({
					authState: 'signedIn',
					authData: payload.data,
				});
			} else if (
				channel === 'auth' &&
				payload.event === 'signOut' &&
				!this.props.authState
			) {
				this.setState({
					authState: 'signIn',
				});
			}

			if (
				channel === 'auth' &&
				payload.event === 'signIn' &&
				!this.props.authState
			) {
				this.setState({ stateFromStorage: true });
			}
		}
	}

	signOut() {
		let payload = {};
		try {
			payload =
				JSON.parse(localStorage.getItem(Constants.AUTH_SOURCE_KEY)) || {};
			localStorage.removeItem(Constants.AUTH_SOURCE_KEY);
		} catch (e) {
			logger.debug(
				`Failed to parse the info from ${Constants.AUTH_SOURCE_KEY} from localStorage with ${e}`
			);
		}
		logger.debug('sign out from the source', payload);
		const { googleSignOut, facebookSignOut, amazonSignOut, auth0SignOut } =
			this.props;
		// @ts-ignore
		switch (payload.provider) {
			case Constants.GOOGLE:
				if (googleSignOut) googleSignOut();
				else logger.debug('No Google signout method provided');
				break;
			case Constants.FACEBOOK:
				if (facebookSignOut) facebookSignOut();
				else logger.debug('No Facebook signout method provided');
				break;
			case Constants.AMAZON:
				if (amazonSignOut) amazonSignOut();
				else logger.debug('No Amazon signout method provided');
				break;
			case Constants.AUTH0:
				// @ts-ignore
				if (auth0SignOut) auth0SignOut(payload.opts);
				else logger.debug('No Auth0 signout method provided');
				break;
			default:
				break;
		}

		if (!Auth || typeof Auth.signOut !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		Auth.signOut()
			.then(() => {
				if (!this.state.stateFromStorage) {
					this.changeState('signedOut');
				}
			})
			.catch((err) => {
				logger.debug(err);
				this.error(err);
			});
	}

	render() {
		const { hide } = this.props;
		if (hide && hide.includes(SignOut)) {
			return null;
		}

		const authState = this.props.authState || this.state.authState;
		const signedIn = authState === 'signedIn';

		const theme = this.props.theme || AmplifyTheme;
		if (!signedIn) {
			return null;
		}

		return (
			<NavButton
				theme={theme}
				onClick={this.signOut}
				data-test={auth.signOut.button}
			>
				{I18n.get('Sign Out')}
			</NavButton>
		);
	}
}

/**
 * @deprecated use named import
 */
export default SignOut;
