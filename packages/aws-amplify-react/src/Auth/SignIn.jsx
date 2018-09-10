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
import { I18n, JS, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

import AuthPiece from './AuthPiece';
import { FederatedButtons } from './FederatedSignIn';

import {
    FormSection,
    FormField,
    SectionHeader,
    SectionBody,
    SectionFooter,
    Button,
    Link,
    Hint,
    Input,
    InputLabel,
    Strike,
    SectionFooterPrimaryContent,
    SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

const logger = new Logger('SignIn');

export default class SignIn extends AuthPiece {
    constructor(props) {
        super(props);

        this.checkContact = this.checkContact.bind(this);
        this.signIn = this.signIn.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
        this.state = {};
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown(e) {
        if (this.props.authState === 'signIn' && !this.props.hide) {
            if (e.keyCode === 13) { // when press enter
                this.signIn();
            }
        }
    }

    checkContact(user) {
        if (!Auth || typeof Auth.verifiedContact !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
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
        if (!Auth || typeof Auth.signIn !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
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
                } 
                else if (err.code === 'PasswordResetRequiredException') {
                    logger.debug('the user requires a new password');
                    this.changeState('requireNewPassword');
                } else {
                    this.error(err);
                }
            });
    }

    showComponent(theme) {
        const { authState, hide = [], federated, onStateChange } = this.props;
        if (hide && hide.includes(SignIn)) { return null; }
        const hideSignUp = hide.some(component => component.name === 'SignUp')
        const hideForgotPassword = hide.some(component => component.name === 'ForgotPassword')
        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Sign in to your account')}</SectionHeader>
                <SectionBody theme={theme}>
                    <div>
                        <FederatedButtons
                            federated={federated}
                            theme={theme}
                            authState={authState}
                            onStateChange={onStateChange}
                        />
                        <Strike>or</Strike>
                    </div>
                    <FormField theme={theme}>
                        <InputLabel>{I18n.get('Username')} *</InputLabel>
                        <Input
                            autoFocus
                            placeholder={I18n.get('Enter your username')}
                            theme={theme}
                            key="username"
                            name="username"
                            onChange={this.handleInputChange}
                        />
                    </FormField>
                    <FormField theme={theme}>
                        <InputLabel>{I18n.get('Password')} *</InputLabel>
                        <Input
                            placeholder={I18n.get('Enter your password')}
                            theme={theme}
                            key="password"
                            type="password"
                            name="password"
                            onChange={this.handleInputChange}
                        />
                        <Hint theme={theme}>
                            {I18n.get('Forget your password? ')}
                            <Link theme={theme} onClick={() => this.changeState('forgotPassword')}>
                                {I18n.get('Reset password')}
                            </Link>
                        </Hint>
                    </FormField>
                    
                </SectionBody>
                <SectionFooter theme={theme}>
                    <SectionFooterPrimaryContent theme={theme}>
                        <Button theme={theme} onClick={this.signIn}>
                            {I18n.get('Sign In')}
                        </Button>
                    </SectionFooterPrimaryContent>
                    <SectionFooterSecondaryContent theme={theme}>
                        {I18n.get('No account? ')}
                        <Link theme={theme} onClick={() => this.changeState('signUp')}>
                            {I18n.get('Create account')}
                        </Link>
                    </SectionFooterSecondaryContent>
                </SectionFooter>
            </FormSection>
        )
    }
}
