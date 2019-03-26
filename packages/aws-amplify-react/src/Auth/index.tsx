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

import Authenticator, { IAuthenticatorProps } from './Authenticator';
import AuthPiece from './AuthPiece';
import { ISignUpConfig } from './SignUp';
export { default as Authenticator, IAuthenticatorProps } from './Authenticator';
export { default as AuthPiece, IAuthPieceProps } from './AuthPiece';
export { default as SignIn, ISignInProps } from './SignIn';
export { default as ConfirmSignIn } from './ConfirmSignIn';
export { default as SignOut, ISignOutProps } from './SignOut';
export { default as RequireNewPassword } from './RequireNewPassword';
export { default as SignUp, ISignUpProps } from './SignUp';
export { default as ConfirmSignUp } from './ConfirmSignUp';
export { default as VerifyContact } from './VerifyContact';
export { default as ForgotPassword } from './ForgotPassword';
export { default as Greetings, IGreetingsProps } from './Greetings';
export { default as FederatedSignIn, FederatedButtons, IFederatedButtonsProps } from './FederatedSignIn';
export { default as TOTPSetup } from './TOTPSetup';
export { default as Loading } from './Loading';

export * from './Provider';

import Greetings from './Greetings';


export interface IWithAuthenticatorProps extends IAuthenticatorProps {
    federated?: any;
}

export interface IWithAuthenticatorState {
    authData: any;
    authState: any;
}

export function withAuthenticator(Comp, includeGreetings: boolean = false, authenticatorComponents: AuthPiece<any, any>[] = [], federated = null, theme = null, signUpConfig: ISignUpConfig = {}) {
    return class extends Component<IWithAuthenticatorProps, IWithAuthenticatorState> {
        public authConfig: any;

        constructor(props: IWithAuthenticatorProps) {
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

        handleAuthStateChange(state: any, data: any) {
            this.setState({ authState: state, authData: data });
        }

        render() {
            const { authState, authData } = this.state;
            const signedIn = (authState === 'signedIn');
            if (signedIn) {
                return (
                    <React.Fragment>
                        { this.authConfig.includeGreetings ? 
                            <Authenticator
                                {...this.props}
                                theme={this.authConfig.theme}
                                federated={this.authConfig.federated || this.props.federated}
                                hideDefault={this.authConfig.authenticatorComponents && this.authConfig.authenticatorComponents.length > 0}
                                signUpConfig={this.authConfig.signUpConfig}
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
                onStateChange={this.handleAuthStateChange}
                children={this.authConfig.authenticatorComponents || []}
            />;
        }
    };
}

export interface IAuthenticatorWrapperProps extends IAuthenticatorProps {

}

export interface IAuthenticatorWrapperState {
    auth: string;
    authData?: any;
}

export class AuthenticatorWrapper extends Component<IAuthenticatorWrapperProps, IAuthenticatorWrapperState> {
    constructor(props: IAuthenticatorWrapperProps) {
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
                {
                    // @ts-ignore
                    this.props.children(this.state.auth)}
            </div>
        );
    }
}
