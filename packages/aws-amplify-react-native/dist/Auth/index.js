var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
import { View } from 'react-native';
import { Logger } from 'aws-amplify';
import Authenticator from './Authenticator';
import AuthPiece from './AuthPiece';
import Loading from './Loading';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import SignUp from './SignUp';
import ConfirmSignUp from './ConfirmSignUp';
import ForgotPassword from './ForgotPassword';
import RequireNewPassword from './RequireNewPassword';
import VerifyContact from './VerifyContact';
import Greetings from './Greetings';
import withOAuth from './withOAuth';

const logger = new Logger('auth components');

export { Authenticator, AuthPiece, SignIn, ConfirmSignIn, SignUp, ConfirmSignUp, ForgotPassword, Loading, RequireNewPassword, VerifyContact, Greetings, withOAuth };

export function withAuthenticator(Comp, includeGreetings = false, authenticatorComponents = [], federated = null, theme = null, signUpConfig = {}) {
	class Wrapper extends React.Component {
		constructor(props) {
			super(props);

			this.handleAuthStateChange = this.handleAuthStateChange.bind(this);

			this.state = { authState: props.authState };

			this.authConfig = {};

			if (typeof includeGreetings === 'object' && includeGreetings !== null) {
				this.authConfig = Object.assign(this.authConfig, includeGreetings);
			} else {
				this.authConfig = {
					includeGreetings,
					authenticatorComponents,
					signUpConfig
				};
			}
		}

		handleAuthStateChange(state, data) {
			this.setState({ authState: state, authData: data });
			if (this.props.onStateChange) {
				this.props.onStateChange(state, data);
			}
		}

		render() {
			const { authState, authData } = this.state;
			const signedIn = authState === 'signedIn';
			if (signedIn) {
				if (!this.authConfig.includeGreetings) {
					return React.createElement(Comp, _extends({}, this.props, {
						authState: authState,
						authData: authData,
						onStateChange: this.handleAuthStateChange
					}));
				}

				return React.createElement(
					View,
					{ style: { flex: 1 } },
					React.createElement(Greetings, {
						authState: authState,
						authData: authData,
						onStateChange: this.handleAuthStateChange,
						theme: theme,
						usernameAttributes: this.authConfig.usernameAttributes
					}),
					React.createElement(Comp, _extends({}, this.props, {
						authState: authState,
						authData: authData,
						onStateChange: this.handleAuthStateChange
					}))
				);
			}

			return React.createElement(Authenticator, _extends({}, this.props, {
				hideDefault: this.authConfig.authenticatorComponents && this.authConfig.authenticatorComponents.length > 0,
				signUpConfig: this.authConfig.signUpConfig,
				onStateChange: this.handleAuthStateChange,
				children: this.authConfig.authenticatorComponents,
				usernameAttributes: this.authConfig.usernameAttributes,
				theme: theme
			}));
		}
	}

	Object.keys(Comp).forEach(key => {
		// Copy static properties in order to be as close to Comp as possible.
		// One particular case is navigationOptions
		try {
			const excludes = ['displayName', 'childContextTypes'];
			if (excludes.includes(key)) {
				return;
			}

			Wrapper[key] = Comp[key];
		} catch (err) {
			logger.warn('not able to assign ' + key, err);
		}
	});

	return Wrapper;
}