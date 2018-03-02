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
    RadioRow,
    MessageRow,
    ButtonRow,
    Link
} from '../AmplifyUI';

import MFASetup from './MFASetupComp';

const logger = new Logger('SelectMFAType');

export default class SelectMFAType extends Component {
    constructor(props) {
        super(props);

        this.verify = this.verify.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

        this.state = {
            mfaSetup: false
        }
    }

    handleInputChange(evt) {
        this.inputs = {};
        const { name, value, type, checked } = evt.target;
        const check_type = ['radio', 'checkbox'].includes(type);
        this.inputs[value] = check_type? checked : value;
    }

    verify() {
        logger.debug('mfatypes inputs', this.inputs);
        const { TOTP, SMS, NOMFA } = this.inputs;
        let mfaMethod = null;
        if (TOTP) {
            mfaMethod = 'TOTP';
        } else if (SMS) {
            mfaMethod = 'SMS';
        } else if (NOMFA) {
            mfaMethod = 'NOMFA';
        }

        if (!this.inputs) {
            logger.debug('No mfa type selected');
            return;
        }
        const user = this.props.authData;

        Auth.setPreferedMFA(user, mfaMethod).then((data) => {
            logger.debug('set prefered mfa success', data);
        }).catch(err => {
            const { message } = err;
            if (message === 'User has not set up software token mfa') {
                this.setState({mfaSetup: true});
            }
            logger.debug('set prefered mfa failed', err);
        });
    }

    selectView(theme) {
        const { MFATypes } = this.props;
        if (!MFATypes || Object.keys(MFATypes).length < 2) {
            logger.debug('less than 2 mfa types available');
            return(
                <div>
                    <a>less than 2 mfa types available</a>
                </div>
            )
        }
        const { SMS, TOTP, NONE } = MFATypes;
        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Select MFA Type')}</SectionHeader>
                <SectionBody theme={theme}>
                    <MessageRow theme={theme}>
                        {I18n.get('Select your preferred MFA Type')}
                    </MessageRow>
                    <div>
                        { SMS? <RadioRow
                                    placeholder={I18n.get('SMS')}
                                    theme={theme}
                                    key="sms"
                                    name="MFAType"
                                    value="SMS"
                                    onChange={this.handleInputChange}
                                /> : null
                        }
                        { TOTP? <RadioRow
                                    placeholder={I18n.get('TOTP')}
                                    theme={theme}
                                    key="totp"
                                    name="MFAType"
                                    value="TOTP"
                                    onChange={this.handleInputChange}
                                /> : null
                        }
                        { NONE? <RadioRow
                                    placeholder={I18n.get('No MFA')}
                                    theme={theme}
                                    key="noMFA"
                                    name="MFAType"
                                    value="NOMFA"
                                    onChange={this.handleInputChange}
                                /> : null
                        }
                        <ButtonRow theme={theme} onClick={this.verify}>{I18n.get('Verify')}</ButtonRow>
                    </div> 
                </SectionBody>
            </FormSection>
        )
    }



    render() {  
        const theme = this.props.theme? theme: AmplifyTheme;
        return (
            <div>
            {this.selectView(theme)}
            { this.state.mfaSetup?
                <MFASetup {...this.props}/> : null
            }</div>
        )
    }
}
