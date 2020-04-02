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
import { Authenticator } from './Authenticator';
export { Authenticator } from './Authenticator';
export { AuthPiece } from './AuthPiece';
export { SignIn } from './SignIn';
export { ConfirmSignIn } from './ConfirmSignIn';
export { SignOut } from './SignOut';
export { RequireNewPassword } from './RequireNewPassword';
export { SignUp } from './SignUp';
export { ConfirmSignUp } from './ConfirmSignUp';
export { VerifyContact } from './VerifyContact';
export { ForgotPassword } from './ForgotPassword';
export { Greetings } from './Greetings';
export { FederatedSignIn, FederatedButtons } from './FederatedSignIn';
export { TOTPSetup } from './TOTPSetup';
export { Loading } from './Loading';

export * from './Provider';
export * from './common/types';

export function withAuthenticator(
	Comp,
	includeGreetings = false,
	authenticatorComponents = [],
	federated = null,
	theme = null,
	signUpConfig = {}
) {
	return class extends React.Component<any, any> {
		public authConfig: any;
		constructor(props) {
			super(props);

			this.handleAuthStateChange = this.handleAuthStateChange.bind(this);

			this.state = {
				authState: props.authState || null,
				authData: props.authData || null,
			};

			this.authConfig = {};

			if (typeof includeGreetings === 'object' && includeGreetings !== null) {
				this.authConfig = Object.assign(this.authConfig, includeGreetings);
			} else {
				this.authConfig = {
					includeGreetings,
					authenticatorComponents,
					federated,
					theme,
					signUpConfig,
				};
			}
		}

		handleAuthStateChange(state, data) {
			this.setState({ authState: state, authData: data });
		}

		render() {
			const { authState, authData } = this.state;

			if (authState === 'signedIn') {
				return (
					<React.Fragment>
						{this.authConfig.includeGreetings ? (
							<Authenticator
								{...this.props}
								theme={this.authConfig.theme}
								federated={this.authConfig.federated || this.props.federated}
								hideDefault={
									this.authConfig.authenticatorComponents &&
									this.authConfig.authenticatorComponents.length > 0
								}
								signUpConfig={this.authConfig.signUpConfig}
								usernameAttributes={this.authConfig.usernameAttributes}
								onStateChange={this.handleAuthStateChange}
								children={this.authConfig.authenticatorComponents || []}
							/>
						) : null}
						<Comp
							{...this.props}
							authState={authState}
							authData={authData}
							onStateChange={this.handleAuthStateChange}
						/>
					</React.Fragment>
				);
			}

			return (
				<Authenticator
					{...this.props}
					theme={this.authConfig.theme}
					federated={this.authConfig.federated || this.props.federated}
					hideDefault={
						this.authConfig.authenticatorComponents &&
						this.authConfig.authenticatorComponents.length > 0
					}
					signUpConfig={this.authConfig.signUpConfig}
					usernameAttributes={this.authConfig.usernameAttributes}
					onStateChange={this.handleAuthStateChange}
					children={this.authConfig.authenticatorComponents || []}
				/>
			);
		}
	};
}

export class AuthenticatorWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.state = { auth: 'init' };

		this.handleAuthState = this.handleAuthState.bind(this);
		this.renderChildren = this.renderChildren.bind(this);
	}

	handleAuthState(state, data) {
		this.setState({ auth: state, authData: data });
	}

	renderChildren() {
		// @ts-ignore
		return this.props.children(this.state.auth);
	}

	render() {
		return (
			<div>
				<Authenticator {...this.props} onStateChange={this.handleAuthState} />
				{this.renderChildren()}
			</div>
		);
	}
}
