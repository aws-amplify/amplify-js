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
import { Auth, I18n, Logger } from 'aws-amplify';

import AuthPiece from './AuthPiece';
import AmplifyTheme from '../AmplifyTheme';
import { Header, Footer, InputRow, ButtonRow, Link } from '../AmplifyUI';

const logger = new Logger('ForgotPassword');

export default class ForgotPassword extends AuthPiece {
    constructor(props) {
        super(props);

        this.send = this.send.bind(this);
        this.submit = this.submit.bind(this);

        this.state = { delivery: null };
    }

    send() {
        const { username } = this.inputs;
        Auth.forgotPassword(username)
            .then(data => {
                logger.debug(data)
                this.setState({ delivery: data.CodeDeliveryDetails });
            })
            .catch(err => this.error(err));
    }

    submit() {
        const { username, code, password } = this.inputs;
        Auth.forgotPasswordSubmit(username, code, password)
            .then(data => {
                logger.debug(data);
                this.changeState('signIn');
                this.setState({ delivery: null });
            })
            .catch(err => this.error(err));
    }

    sendView() {
        const theme = this.props.theme || AmplifyTheme;
        return (
            <div>
                <InputRow
                    autoFocus
                    placeholder={I18n.get('Username')}
                    theme={theme}
                    key="username"
                    name="username"
                    onChange={this.handleInputChange}
                />
                <ButtonRow theme={theme} onClick={this.send}>
                    {I18n.get('Send Code')}
                </ButtonRow>
            </div>
        )
    }

    submitView() {
        const theme = this.props.theme || AmplifyTheme;
        return (
            <div>
                <InputRow
                    placeholder={I18n.get('Code')}
                    theme={theme}
                    key="code"
                    name="code"
                    onChange={this.handleInputChange}
                />
                <InputRow
                    placeholder={I18n.get('New Password')}
                    theme={theme}
                    type="password"
                    key="password"
                    name="password"
                    onChange={this.handleInputChange}
                />
                <ButtonRow theme={theme} onClick={this.submit}>
                    {I18n.get('Submit')}
                </ButtonRow>
            </div>
        )
    }

    render() {
        const { authState, hide } = this.props;
        if (authState !== 'forgotPassword') { return null; }

        const theme = this.props.theme || AmplifyTheme;

        if (hide && hide.includes(ForgotPassword)) { return null; }

        return (
            <div className="amplify-form-section" style={theme.formSection}>
                <Header theme={theme}>{I18n.get('Forgot Password')}</Header>
                <div className="amplify-form-body" style={theme.sectionBody}>
                    { this.state.delivery? this.submitView() : this.sendView() }
                </div>
                <Footer theme={theme}>
                    <Link theme={theme} onClick={() => this.changeState('signIn')}>
                        {I18n.get('Back to Sign In')}
                    </Link>
                </Footer>
            </div>
        )
    }
}
