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
import { Component } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';

import { UsernameAttributes, FederatedConfig, AuthState } from './common/types';
import Authenticator from './Authenticator';

export { default as Authenticator } from './Authenticator';
export { default as AuthPiece } from './AuthPiece';
export { default as SignIn } from './SignIn';
export { default as ConfirmSignIn } from './ConfirmSignIn';
export { default as SignOut } from './SignOut';
export { default as RequireNewPassword } from './RequireNewPassword';
export { default as SignUp } from './SignUp';
export { default as ConfirmSignUp } from './ConfirmSignUp';
export { default as VerifyContact } from './VerifyContact';
export { default as ForgotPassword } from './ForgotPassword';
export { default as Greetings } from './Greetings';
export { default as FederatedSignIn, FederatedButtons } from './FederatedSignIn';
export { default as TOTPSetup } from './TOTPSetup';
export { default as Loading } from './Loading';

export * from './Provider';

interface AuthenticatorPropsBase {
    federated?: FederatedConfig
    onStateChange: (state: AuthState, data: {}) => void
}

interface AuthenticatorPropsSignedIn extends AuthenticatorPropsBase {
    authState: 'signedIn'
    authData: CognitoUser
}

interface AuthenticatorPropsNotSignedIn extends AuthenticatorPropsBase {
    authState:
        | 'signIn'
        | 'signUp'
        | 'confirmSignIn'
        | 'confirmSignUp'
        | 'forgotPassword'
        | 'requireNewPassword'
        | 'verifyContact'
    authData: null
}

export type AuthenticatorProps =
    | AuthenticatorPropsSignedIn
    | AuthenticatorPropsNotSignedIn

interface State {
    authState?: AuthenticatorProps['authState']
    authData?: AuthenticatorProps['authData']
}

export function withAuthenticator<P extends AuthenticatorProps>(
    Comp: React.ComponentType<P>,
    includeGreetings: boolean = false,
    authenticatorComponents: React.ComponentType[] = [],
    federated: FederatedConfig = null,
    theme: {} = null,
    signUpConfig: {} = {}
): React.ComponentClass<Omit<P, keyof AuthenticatorProps>> {
    return class extends Component<Omit<P, keyof AuthenticatorProps>, State> {
        private authConfig: {
            includeGreetings?: boolean
            authenticatorComponents?: React.ComponentType[],
            federated?: FederatedConfig,
            usernameAttributes?: UsernameAttributes
            theme?: {},
            signUpConfig?: {}
        }

        constructor(props) {
            super(props);

            this.handleAuthStateChange = this.handleAuthStateChange.bind(this);

            this.state = {
                authState: props.authState || null,
                authData: props.authData || null
            };

            this.authConfig = {};

            if (typeof includeGreetings === 'object' && includeGreetings !== null){
                this.authConfig = Object.assign(this.authConfig, includeGreetings)
            } else {
                this.authConfig = {
                    includeGreetings,
                    authenticatorComponents,
                    federated,
                    theme,
                    signUpConfig
                }
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
                        { this.authConfig.includeGreetings ? 
                            <Authenticator
                                {...this.props}
                                theme={this.authConfig.theme}
                                federated={this.authConfig.federated || this.props.federated}
                                hideDefault={this.authConfig.authenticatorComponents && this.authConfig.authenticatorComponents.length > 0}
                                signUpConfig={this.authConfig.signUpConfig}
                                usernameAttributes={this.authConfig.usernameAttributes}
                                onStateChange={this.handleAuthStateChange}
                                children={this.authConfig.authenticatorComponents || []}
                            /> : null
                        }
                        <Comp
                            {...this.props}
                            authState={authState}
                            authData={authData}
                            onStateChange={this.handleAuthStateChange}
                        />
                    </React.Fragment>
                );
            }

            return <Authenticator
                {...this.props}
                theme={this.authConfig.theme}
                federated={this.authConfig.federated || this.props.federated}
                hideDefault={this.authConfig.authenticatorComponents && this.authConfig.authenticatorComponents.length > 0}
                signUpConfig={this.authConfig.signUpConfig}
                usernameAttributes={this.authConfig.usernameAttributes}
                onStateChange={this.handleAuthStateChange}
                children={this.authConfig.authenticatorComponents || []}
            />;
        }
    };
}

interface AuthenticatorWrapperProps {
    children: (auth: AuthenticatorWrapperState['auth']) => React.ReactNode
}
interface AuthenticatorWrapperState {
    auth: string
    authData?: CognitoUser
}

export class AuthenticatorWrapper extends Component<AuthenticatorWrapperProps, AuthenticatorWrapperState> {
    constructor(props) {
        super(props);

        this.state = { auth: 'init' };

        this.handleAuthState = this.handleAuthState.bind(this);
    }

    handleAuthState(state, data) {
        this.setState({ auth: state, authData: data });
    }

    render() {
        return (
            <div>
                <Authenticator {...this.props} onStateChange={this.handleAuthState} />
                {this.props.children(this.state.auth)}
            </div>
        );
    }
}
