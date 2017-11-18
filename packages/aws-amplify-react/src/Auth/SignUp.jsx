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

import { Auth, I18n } from 'aws-amplify';

import AuthPiece from './AuthPiece';
import AmplifyTheme from '../AmplifyTheme';
import { Header, Footer, InputRow, ButtonRow, Link } from '../AmplifyUI';

export default class SignUp extends AuthPiece {
    constructor(props) {
        super(props);

        this.signUp = this.signUp.bind(this);
    }

    signUp() {
        const { username, password, email, phone_number } = this.inputs;
        Auth.signUp(username, password, email, phone_number)
            .then(() => this.changeState('confirmSignUp', username))
            .catch(err => this.error(err));
    }

    render() {
        const { authState, hide } = this.props;
        const theme = this.props.theme || AmplifyTheme;
        if (authState !== 'signUp') { return null; }

        if (hide && hide.includes(SignUp)) { return null; }

        return (
            <div style={theme.formSection}>
                <Header theme={theme}>{I18n.get('Sign Up Account')}</Header>
                <div style={theme.sectionBody}>
                    <InputRow
                        authFocus
                        placeholder={I18n.get('Username')}
                        theme={theme}
                        key="username"
                        name="username"
                        onChange={this.handleInputChange}
                    />
                    <InputRow
                        placeholder={I18n.get('Password')}
                        theme={theme}
                        type="password"
                        key="password"
                        name="password"
                        onChange={this.handleInputChange}
                    />
                    <InputRow
                        placeholder={I18n.get('Email')}
                        theme={theme}
                        key="email"
                        name="email"
                        onChange={this.handleInputChange}
                    />
                    <InputRow
                        placeholder={I18n.get('Phone Number')}
                        theme={theme}
                        key="phone_number"
                        name="phone_number"
                        onChange={this.handleInputChange}
                    />
                    <ButtonRow onClick={this.signUp} theme={theme}>{I18n.get('Sign Up')}</ButtonRow>
                </div>
                <Footer theme={theme}>
                    <div style={theme.col6}>
                        <Link theme={theme} onClick={() => this.changeState('confirmSignUp')}>
                            {I18n.get('Confirm a Code')}
                        </Link>
                    </div>
                    <div style={Object.assign({textAlign: 'right'}, theme.col6)}>
                        <Link style={theme.a} onClick={() => this.changeState('signIn')}>
                            {I18n.get('Sign In')}
                        </Link>
                    </div>
                </Footer>
            </div>
        )
    }
}
