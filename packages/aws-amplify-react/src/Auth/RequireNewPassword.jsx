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

import { I18n, JS, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

import AuthPiece from './AuthPiece';
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

const logger = new Logger('RequireNewPassword');

export default class RequireNewPassword extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['requireNewPassword'];
        this.change = this.change.bind(this);
        this.checkContact = this.checkContact.bind(this);
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

    change() {
        const user = this.props.authData;
        const { password } = this.inputs;
        const { requiredAttributes } = user.challengeParam;

        let finalRequiredAttributes = {};
        let that = this;
        Object.keys(requiredAttributes).map(function (key) {

            let attributeName = requiredAttributes[key];
            finalRequiredAttributes[attributeName] = that.inputs[attributeName];

            return finalRequiredAttributes;
        })

        if (!Auth || typeof Auth.completeNewPassword !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        Auth.completeNewPassword(user, password, finalRequiredAttributes)
            .then(user => {
                logger.debug('complete new password', user);
                if (user.challengeName === 'SMS_MFA') {
                    this.changeState('confirmSignIn', user);
                } else if (user.challengeName === 'MFA_SETUP') {
                    logger.debug('TOTP setup', user.challengeParam);
                    this.changeState('TOTPSetup', user);
                } else {
                    this.checkContact(user);
                }

            })
            .catch(err => this.error(err));
    }

    showComponent(theme) {
        const { hide } = this.props;
        if (hide && hide.includes(RequireNewPassword)) { return null; }

        const user = this.props.authData;
        const { requiredAttributes } = user.challengeParam;
        let that = this;

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Change Password')}</SectionHeader>
                <SectionBody>
                    <InputRow
                        autoFocus
                        placeholder={I18n.get('New Password')}
                        theme={theme}
                        key="password"
                        name="password"
                        type="password"
                        onChange={this.handleInputChange}
                    />
                    {
                        Object.keys(requiredAttributes).map(function (key) {

                            let value = requiredAttributes[key];
                            let displayValue = that.capitalize(value);
                            return (
                                <InputRow
                                    placeholder={I18n.get(displayValue)}
                                    theme={theme}
                                    key={value}
                                    name={value}
                                    type="text"
                                    onChange={that.handleInputChange}
                                />
                            );

                        })
                    }
                    <ButtonRow theme={theme} onClick={this.change}>
                        {I18n.get('Change')}
                    </ButtonRow>
                </SectionBody>
                <SectionFooter theme={theme}>
                    <Link theme={theme} onClick={() => this.changeState('signIn')}>
                        {I18n.get('Back to Sign In')}
                    </Link>
                </SectionFooter>
            </FormSection>
        )
    }

    capitalize(str) {
        if (str === undefined) {
            return str;
        }
        return str.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
}
