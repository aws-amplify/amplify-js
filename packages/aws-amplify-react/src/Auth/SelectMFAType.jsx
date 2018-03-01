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

const logger = new Logger('SelectMFAType');

export default class SelectMFAType extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['selectMFAType'];
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

    selectView() {
        const { MFATypes } = this.props;
        const { SMS, TOTP, NONE } = MFATypes;
        return (
            <div>
                { SMS? <RadioRow
                            placeholder={I18n.get('SMS')}
                            theme={theme}
                            key="sms"
                            name="MFATypes"
                            value="sms"
                            onChange={this.handleInputChange}
                         /> : null
                }
                { TOTP? <RadioRow
                            placeholder={I18n.get('TOTP')}
                            theme={theme}
                            key="totp"
                            name="MFATypes"
                            value="totp"
                            onChange={this.handleInputChange}
                         /> : null
                }
                { NONE? <RadioRow
                            placeholder={I18n.get('No MFA')}
                            theme={theme}
                            key="noMFA"
                            name="MFATypes"
                            value="noMFA"
                            onChange={this.handleInputChange}
                         /> : null
                }
                <ButtonRow theme={theme} onClick={this.verify}>{I18n.get('Verify')}</ButtonRow>
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
