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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Authenticator from './Authenticator';

export { default as Authenticator } from './Authenticator';
export { default as AuthPiece } from './AuthPiece';
export { default as SignIn } from './SignIn';
export { default as ConfirmSignIn } from './ConfirmSignIn';
export { default as SignUp } from './SignUp';
export { default as ConfirmSignUp } from './ConfirmSignUp';
export { default as Greetings } from './Greetings';

import Greetings from './Greetings';

export function withAuthenticator(Comp, includeGreetings=false) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.handleAuthStateChange = this.handleAuthStateChange.bind(this);

            this.state = { auth: props.authState };
        }

        handleAuthStateChange(state, data) {
            this.setState({ auth: state, authData: data });
        }

        render() {
            const signedIn = (this.state.auth === 'signedIn');
            if (signedIn) {
                return (
                    <div>
                        {
                            includeGreetings?
                            <Greetings
                                authState={this.state.auth}
                                authData={this.state.authData}
                                onStateChange={this.handleAuthStateChange}
                            />
                            : null
                        }
                        <Comp
                            {...this.props}
                            authState={this.state.auth}
                            authData={this.state.authData}
                            onStateChange={this.handleAuthStateChange}
                        />
                    </div>
                )
            }

            return <Authenticator
                {...this.props}
                onStateChange={this.handleAuthStateChange}
            />
        }
    }
}

export class AuthenticatorWrapper extends Component {
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
        )
    }
}

AuthenticatorWrapper.propTypes = {
    children: PropTypes.func.isRequired
}
