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

import QRCode from 'qrcode.react';

const logger = new Logger('MFASetup');

export default class MFASetup extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['mfaSetup'];
        this.setup = this.setup.bind(this);
        this.showSecretCode = this.showSecretCode.bind(this);
        this.verifyTotpToken= this.verifyTotpToken.bind(this);

        this.state = {
            code: null
        }
    }

    setup() {
        const user = this.props.authData;
        Auth.setupMFA(user).then((data) => {
            logger.debug('secret key', data);
            const code = "otpauth://totp/AWSCognito:"+ user.username + "?secret=" + data + "&issuer=AWSCognito";
            this.setState({code});

        }).catch((err) => logger.debug('mfa setup failed', err));
    }

    verifyTotpToken() {
        const user = this.props.authData;
        const { totpCode } = this.inputs;
        Auth.verifyTotpToken(user, totpCode)
            .then(() => this.changeState('signedIn', user))
            .catch(err => this.error(err));
    }

    showSecretCode(code) {
        if (!code) return null;
        return (
            <div>
                <QRCode value={code}/>
            </div>
        )
    }

    showComponent(theme) {
        const { hide } = this.props;
        if (hide && hide.includes(MFASetup)) { return null; }
        let code = this.state.code;

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('MFA Setup')}</SectionHeader>
                <SectionBody theme={theme}>
                    {this.showSecretCode(code)}
                    <ButtonRow theme={theme} onClick={this.setup}>
                        {I18n.get('Get secret key')}
                    </ButtonRow>
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
