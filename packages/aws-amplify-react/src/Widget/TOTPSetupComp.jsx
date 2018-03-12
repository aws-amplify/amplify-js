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

import AmplifyTheme from '../AmplifyTheme';
import {
    FormSection,
    SectionHeader,
    SectionBody,
    SectionFooter,
    InputRow,
    ButtonRow,
    MessageRow,
    Link
} from '../AmplifyUI';

import QRCode from 'qrcode.react';

const logger = new Logger('TOTPSetupComp');

export default class TOTPSetupComp extends Component {
    constructor(props) {
        super(props);

        this.setup = this.setup.bind(this);
        this.showSecretCode = this.showSecretCode.bind(this);
        this.verifyTotpToken= this.verifyTotpToken.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.triggerTOTPEvent = this.triggerTOTPEvent.bind(this);

        this.state = {
            code: null,
            setupMessage: null
        }
    }

    triggerTOTPEvent(event, data, user) {
        if (this.props.onTOTPEvent) {
            this.props.onTOTPEvent(event, data, user);
        }
    }
    
    handleInputChange(evt) {
        this.setState({setupMessage: null});
        this.inputs = {};
        const { name, value, type, checked } = evt.target;
        const check_type = ['radio', 'checkbox'].includes(type);
        this.inputs[name] = check_type? checked : value;
    }

    setup() {
        this.setState({setupMessage: null});
        const user = this.props.authData;
        Auth.setupTOTP(user).then((data) => {
            logger.debug('secret key', data);
            const code = "otpauth://totp/AWSCognito:"+ user.username + "?secret=" + data + "&issuer=AWSCognito";
            this.setState({code});
        }).catch((err) => logger.debug('totp setup failed', err));
    }

    verifyTotpToken() {
        if (!this.inputs) {
            logger.debug('no input');
            return;
        }
        const user = this.props.authData;
        const { totpCode } = this.inputs;
        Auth.verifyTotpToken(user, totpCode)
            .then(() => {
                // set it to preferred mfa
                Auth.setPreferredMFA(user, 'TOTP');
                this.setState({setupMessage: 'Setup TOTP successfully!'});
                logger.debug('set up totp success!');
                this.triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
            })
            .catch(err => {
                this.setState({setupMessage: 'Setup TOTP failed!'});
                logger.error(err);
            });
    }

    showSecretCode(code, theme) {
        if (!code) return null;
        return (
            <div>
                <QRCode value={code}/>
                <InputRow
                    autoFocus
                    placeholder={I18n.get('totp verification token')}
                    theme={theme}
                    key="totpCode"
                    name="totpCode"
                    onChange={this.handleInputChange}
                />
                <ButtonRow theme={theme} onClick={this.verifyTotpToken}>
                    {I18n.get('Verify')}
                </ButtonRow>
            </div>
        )
    }

    render() {
        const theme = this.props.theme ? this.props.theme: AmplifyTheme;
        let code = this.state.code;

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('TOTP Setup')}</SectionHeader>
                <SectionBody theme={theme}>
                    <ButtonRow theme={theme} onClick={this.setup}>
                        {I18n.get('Get secret key')}
                    </ButtonRow>
                    {this.showSecretCode(code, theme)}
                    {this.state.setupMessage? <MessageRow theme={theme}>
                        {I18n.get(this.state.setupMessage)}
                    </MessageRow> : null }   
                </SectionBody>
            </FormSection>
        )
    }
}
