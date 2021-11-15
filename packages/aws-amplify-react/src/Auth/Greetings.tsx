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
import {
	NavBar,
	Nav,
	NavRight,
	NavItem,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import { SignOut } from './SignOut';
import { withGoogle, withAmazon, withFacebook, withAuth0 } from './Provider';
import { UsernameAttributes } from './common/types';

const logger = new Logger('Greetings');

export interface IGreetingsProps extends IAuthPieceProps {
	federated?: any;
	inGreeting?: string;
	outGreeting?: string;
}

export interface IGreetingsState extends IAuthPieceState {
	authData?: any;
	authState?: string;
	stateFromStorage?: boolean;
}

export class Greetings extends AuthPiece<IGreetingsProps, IGreetingsState> {
	private _isMounted: boolean;

	constructor(props: IGreetingsProps) {
		super(props);
		this.state = {};
		this.onHubCapsule = this.onHubCapsule.bind(this);
		this.inGreeting = this.inGreeting.bind(this);
		Hub.listen('auth', this.onHubCapsule);
		this._validAuthStates = ['signedIn'];
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
				.catch((err) => logger.debug(err));
		}
	}

	onHubCapsule(capsule) {
		if (this._isMounted) {
			const { channel, payload } = capsule;
			if (channel === 'auth' && payload.event === 'signIn') {
				this.setState({
					authState: 'signedIn',
					authData: payload.data,
				});
				if (!this.props.authState) {
					this.setState({ stateFromStorage: true });
				}
			} else if (
				channel === 'auth' &&
				payload.event === 'signOut' &&
				!this.props.authState
			) {
				this.setState({
					authState: 'signIn',
				});
			}
		}
	}

	inGreeting(name) {
		const { usernameAttributes = UsernameAttributes.USERNAME } = this.props;
		const prefix =
			usernameAttributes === UsernameAttributes.USERNAME
				? `${I18n.get('Hello')} `
				: '';
		return `${prefix}${name}`;
	}
	outGreeting() {
		return '';
	}

	userGreetings(theme) {
		const user = this.props.authData || this.state.authData;
		const greeting = this.props.inGreeting || this.inGreeting;
		// get name from attributes first
		const { usernameAttributes = 'username' } = this.props;
		let name = '';
		switch (usernameAttributes) {
			case UsernameAttributes.EMAIL:
				// Email as Username
				name = user.attributes ? user.attributes.email : user.username;
				break;
			case UsernameAttributes.PHONE_NUMBER:
				// Phone number as Username
				name = user.attributes ? user.attributes.phone_number : user.username;
				break;
			default:
				const nameFromAttr = user.attributes
					? user.attributes.name ||
					  (user.attributes.given_name
							? user.attributes.given_name + ' ' + user.attributes.family_name
							: undefined)
					: undefined;
				name = nameFromAttr || user.name || user.username;
				break;
		}

		const message = typeof greeting === 'function' ? greeting(name) : greeting;

		return (
			<span>
				<NavItem theme={theme}>{message}</NavItem>
				{this.renderSignOutButton()}
			</span>
		);
	}

	renderSignOutButton() {
		const { federated = {} } = this.props;
		const { google_client_id, facebook_app_id, amazon_client_id, auth0 } =
			federated;
		// @ts-ignore
		const config = Auth.configure();
		const { oauth = {} } = config;
		// @ts-ignore
		const googleClientId = google_client_id || config.googleClientId;
		// @ts-ignore
		const facebookAppId = facebook_app_id || config.facebookClientId;
		// @ts-ignore
		const amazonClientId = amazon_client_id || config.amazonClientId;
		// @ts-ignore
		const auth0_config = auth0 || oauth.auth0;

		let SignOutComponent = SignOut;
		// @ts-ignore
		if (googleClientId) SignOutComponent = withGoogle(SignOut);
		// @ts-ignore
		if (facebookAppId) SignOutComponent = withFacebook(SignOut);
		// @ts-ignore
		if (amazonClientId) SignOutComponent = withAmazon(SignOut);
		// @ts-ignore
		if (auth0_config) SignOutComponent = withAuth0(SignOut);

		const stateAndProps = Object.assign({}, this.props, this.state);

		return <SignOutComponent {...stateAndProps} />;
	}

	noUserGreetings(theme) {
		const greeting = this.props.outGreeting || this.outGreeting;
		const message = typeof greeting === 'function' ? greeting() : greeting;
		return message ? <NavItem theme={theme}>{message}</NavItem> : null;
	}

	render() {
		const { hide } = this.props;
		if (hide && hide.includes(Greetings)) {
			return null;
		}

		const authState = this.props.authState || this.state.authState;
		const signedIn = authState === 'signedIn';

		const theme = this.props.theme || AmplifyTheme;
		const greeting = signedIn
			? this.userGreetings(theme)
			: this.noUserGreetings(theme);
		if (!greeting) {
			return null;
		}

		return (
			<NavBar theme={theme} data-test={auth.greetings.navBar}>
				<Nav theme={theme} data-test={auth.greetings.nav}>
					<NavRight theme={theme} data-test={auth.greetings.navRight}>
						{greeting}
					</NavRight>
				</Nav>
			</NavBar>
		);
	}
}

/**
 * @deprecated use named import
 */
export default Greetings;
