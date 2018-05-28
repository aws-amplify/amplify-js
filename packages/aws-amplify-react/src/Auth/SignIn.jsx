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
import { Auth, I18n, Logger, JS } from 'aws-amplify';

import AuthPiece from './AuthPiece';
import { FederatedButtons } from './FederatedSignIn';
import AmplifyTheme from '../AmplifyTheme';
import {
    FormSection,
    SectionHeader,
    SectionBody,
    SectionFooter,
    InputRow,
    ButtonRow,
    Link
} from '../AmplifyUI';

const logger = new Logger('SignIn');

export default class SignIn extends AuthPiece {
    constructor(props) {
        super(props);

        this.checkContact = this.checkContact.bind(this);
        this.signIn = this.signIn.bind(this);

        this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
        this.state = {};
    }

    checkContact(user) {
        Auth.verifiedContact(user)
            .then(data => {
                if (!JS.isEmpty(data.verified)) {
                    this.changeState('signedIn', user);
                } else {
                    user = Object.assign(user, data);
                    this.changeState('verifyContact', user);
                }
            });
    }

    signIn() {
        const { username, password } = this.inputs;
        Auth.signIn(username, password)
            .then(user => {
                logger.debug(user);
                if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
                    logger.debug('confirm user with ' + user.challengeName);
                    this.changeState('confirmSignIn', user);
                } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                    logger.debug('require new password', user.challengeParam);
                    this.changeState('requireNewPassword', user);
                } else if (user.challengeName === 'MFA_SETUP') {
                    logger.debug('TOTP setup', user.challengeParam);
                    this.changeState('TOTPSetup', user);
                }
                else {
                    this.checkContact(user);
                }
            })
            .catch(err => {
                if (err.code === 'UserNotConfirmedException') {
                    logger.debug('the user is not confirmed');
                    this.changeState('confirmSignUp');
                } else {
                    this.error(err);
                }
            });
    }

    showComponent(theme) {
        const { authState, hide, federated, onStateChange } = this.props;
        if (hide && hide.includes(SignIn)) { return null; }

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Sign In Account')}</SectionHeader>
                <SectionBody theme={theme}>
                    <InputRow
                        autoFocus
                        placeholder={I18n.get('Username')}
                        theme={theme}
                        key="username"
                        name="username"
                        onChange={this.handleInputChange}
                    />
                    <InputRow
                        placeholder={I18n.get('Password')}
                        theme={theme}
                        key="password"
                        type="password"
                        name="password"
                        onChange={this.handleInputChange}
                    />
                    <ButtonRow theme={theme} onClick={this.signIn}>
                        {I18n.get('Sign In')}
                    </ButtonRow>
                    <FederatedButtons
                        federated={federated}
                        theme={theme}
                        authState={authState}
                        onStateChange={onStateChange}
                    />
                </SectionBody>
                <SectionFooter theme={theme}>
                    <div style={theme.col6}>
                        <Link theme={theme} onClick={() => this.changeState('forgotPassword')}>
                            {I18n.get('Forgot Password')}
                        </Link>
                    </div>
                    <div style={Object.assign({textAlign: 'right'}, theme.col6)}>
                        <Link theme={theme} onClick={() => this.changeState('signUp')}>
                            {I18n.get('Sign Up')}
                        </Link>
                    </div>
                </SectionFooter>
            </FormSection>
        )
    }
}
