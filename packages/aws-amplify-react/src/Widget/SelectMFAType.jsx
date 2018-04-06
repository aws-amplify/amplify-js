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

import TOTPSetupComp from './TOTPSetupComp';

const logger = new Logger('SelectMFAType');

export default class SelectMFAType extends Component {
    constructor(props) {
        super(props);

        this.verify = this.verify.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

        this.state = {
            TOTPSetup: false,
            selectMessage: null
        }
    }

    handleInputChange(evt) {
        // clear current state
        this.setState({
            TOTPSetup: false,
            selectMessage: null
        });
        this.inputs = {};
        const { name, value, type, checked } = evt.target;
        const check_type = ['radio', 'checkbox'].includes(type);
        this.inputs[value] = check_type? checked : value;
    }

    verify() {
        logger.debug('mfatypes inputs', this.inputs);
        if (!this.inputs) {
            logger.debug('No mfa type selected');
            return;
        }
        const { TOTP, SMS, NOMFA } = this.inputs;
        let mfaMethod = null;
        if (TOTP) {
            mfaMethod = 'TOTP';
        } else if (SMS) {
            mfaMethod = 'SMS';
        } else if (NOMFA) {
            mfaMethod = 'NOMFA';
        }

        const user = this.props.authData;

        Auth.setPreferredMFA(user, mfaMethod).then((data) => {
            logger.debug('set preferred mfa success', data);
            this.setState({selectMessage: 'Successful! Now you have changed to MFA Type: ' + mfaMethod});
 
        }).catch(err => {
            const { message } = err;
            if (message === 'User has not set up software token mfa') {
                this.setState({TOTPSetup: true});
                this.setState({selectMessage: 'You need to setup TOTP'})
            }
            else {
                logger.debug('set preferred mfa failed', err);
                this.setState({selectMessage: 'Failed! You cannot select MFA Type for now!'})
            }
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
        const { SMS, TOTP, Optional } = MFATypes;
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
                        { Optional? <RadioRow
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
                    { this.state.selectMessage? 
                    <MessageRow theme={theme}>
                        {I18n.get(this.state.selectMessage)}
                    </MessageRow> 
                    : null}
                </SectionBody>
            </FormSection>
        )
    }



    render() {  
        const theme = this.props.theme? theme: AmplifyTheme;
        return (
            <div>
            {this.selectView(theme)}
            { this.state.TOTPSetup?
                <TOTPSetupComp {...this.props}/> : null
            }</div>
        )
    }
}
