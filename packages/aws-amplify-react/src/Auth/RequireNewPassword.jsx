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
    }

    change() {
        const user = this.props.authData;
        const { password } = this.inputs;
        const { requiredAttributes } = user.challengeParam;
        Auth.completeNewPassword(user, password, requiredAttributes)
            .then(user => {
                logger.debug('complete new password', user);
                if (user.challengeName === 'SMS_MFA') {
                    this.changeState('confirmSignIn', user);
                } else {
                    this.changeState('signedIn', user);
                }
            })
            .catch(err => this.error(err));
    }

    showComponent(theme) {
        const { hide } = this.props;
        if (hide && hide.includes(RequireNewPassword)) { return null; }

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
}
