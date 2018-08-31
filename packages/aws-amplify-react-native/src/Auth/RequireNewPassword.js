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
import {
    View,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import {
    Auth,
    I18n,
    Logger
} from 'aws-amplify';
import {
    FormField,
    AmplifyButton,
    LinkCell,
    Header,
    ErrorRow
} from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('SignIn');

export default class RequireNewPassword extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['requireNewPassword'];
        this.state = {
            password: null,
            error: null
        }

        this.change = this.change.bind(this);
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

    change() {
        const user = this.props.authData;
        const { password } = this.state;
        logger.debug('Require new password for ' + user.username);
        Auth.completeNewPassword(user, password, user.challengeParam.requiredAttributes)
            .then(user => {
                if (user.challengeName === 'SMS_MFA') {
                    this.changeState('confirmSignIn', user);
                } else {
                    this.checkContact(user);
                }
            })
            .catch(err => this.error(err));
    }

    showComponent(theme) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={theme.section}>
                    <Header theme={theme}>{I18n.get('Confirm Sign In')}</Header>
                    <View style={theme.sectionBody}>
                        <FormField
                            theme={theme}
                            onChangeText={(text) => this.setState({ password: text })}
                            label={I18n.get('Password')}
                            placeholder={I18n.get('Enter your password')}
                            secureTextEntry={true}
                            required={true}
                        />
                        <AmplifyButton
                            text={I18n.get('Change Password')}
                            onPress={this.change}
                            disabled={!this.state.password}
                        />
                    </View>
                    <View style={theme.sectionFooter}>
                        <LinkCell theme={theme} onPress={() => this.changeState('signIn')}>
                            {I18n.get('Back to Sign In')}
                        </LinkCell>
                    </View>
                    <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
