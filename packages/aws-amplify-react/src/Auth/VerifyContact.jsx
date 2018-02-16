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
    RadioRow,
    MessageRow,
    ButtonRow,
    Link
} from '../AmplifyUI';

const logger = new Logger('VerifyContact');

export default class VerifyContact extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['verifyContact'];
        this.verify = this.verify.bind(this);
        this.submit = this.submit.bind(this);

        this.state = { verifyAttr: null }
    }

    verify() {
        const { contact } = this.inputs;
        if (!contact) {
            this.error('Neither Email nor Phone Number selected');
            return;
        }

        Auth.verifyCurrentUserAttribute(contact)
            .then(data => {
                logger.debug(data);
                this.setState({ verifyAttr: contact });
            })
            .catch(err => this.error(err));
    }

    submit() {
        const attr = this.state.verifyAttr;
        const { code } = this.inputs;
        Auth.verifyCurrentUserAttributeSubmit(attr, code)
            .then(data => {
                logger.debug(data);
                this.changeState('signedIn', this.props.authData);
                this.setState({ verifyAttr: null });
            })
            .catch(err => this.error(err));
    }

    verifyView() {
        const user = this.props.authData;
        if (!user) {
            logger.debug('no user for verify');
            return null;
        }
        const { unverified } = user;
        if (!unverified) {
            logger.debug('no unverified on user');
            return null;
        }
        const { email, phone_number } = unverified;
        const theme = this.props.theme || AmplifyTheme;
        return (
            <div>
                { email? <RadioRow
                            placeholder={I18n.get('Email')}
                            theme={theme}
                            key="email"
                            name="contact"
                            value="email"
                            onChange={this.handleInputChange}
                         /> : null
                }
                { phone_number? <RadioRow
                                    placeholder={I18n.get('Phone Number')}
                                    theme={theme}
                                    key="phone_number"
                                    name="contact"
                                    value="phone_number"
                                    onChange={this.handleInputChange}
                                /> : null
                }
                <ButtonRow theme={theme} onClick={this.verify}>{I18n.get('Verify')}</ButtonRow>
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
                <ButtonRow theme={theme} onClick={this.submit}>{I18n.get('Submit')}</ButtonRow>
            </div>
        )
    }

    showComponent(theme) {
        const { authData, hide } = this.props;
        if (hide && hide.includes(VerifyContact)) { return null; }

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Verify Contact')}</SectionHeader>
                <SectionBody theme={theme}>
                    <MessageRow theme={theme}>
                        {I18n.get('Account recovery requires verified contact information')}
                    </MessageRow>
                    { this.state.verifyAttr? this.submitView() : this.verifyView() }
                </SectionBody>
                <SectionFooter theme={theme}>
                    <Link theme={theme} onClick={() => this.changeState('signedIn')}>
                        {I18n.get('Skip')}
                    </Link>
                </SectionFooter>
            </FormSection>
        )
    }
}
