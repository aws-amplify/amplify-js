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

const logger = new Logger('ForgotPassword');

export default class ForgotPassword extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['forgotPassword'];
        this.state = { delivery: null };

        this.send = this.send.bind(this);
        this.submit = this.submit.bind(this);

    }

    send() {
        const { username } = this.state;
        if (!username) {
            this.error('Username cannot be empty');
            return;
        }
        Auth.forgotPassword(username)
            .then(data => {
                logger.debug(data)
                this.setState({ delivery: data.CodeDeliveryDetails });
            })
            .catch(err => this.error(err));
    }

    submit() {
        const { username, code, password } = this.state;
        Auth.forgotPasswordSubmit(username, code, password)
            .then(data => {
                logger.debug(data);
                this.changeState('signIn');
            })
            .catch(err => this.error(err));
    }

    forgotBody(theme) {
        return (
            <View style={theme.sectionBody}>
                <FormField
                    theme={theme}
                    onChangeText={(text) => this.setState({ username: text })}
                    label={I18n.get('Username')}
                    placeholder={I18n.get('Enter your username')}
                    required={true}
                />
                <AmplifyButton
                    text={I18n.get('Send').toUpperCase()}
                    style={theme.button}
                    onPress={this.send}
                    disabled={!this.state.username}
                />
            </View>
        )
    }

    submitBody(theme) {
        return (
            <View style={theme.sectionBody}>
                <FormField
                    theme={theme}
                    onChangeText={(text) => this.setState({ code: text })}
                    label={I18n.get('Confirmation Code')}
                    placeholder={I18n.get('Enter your confirmation code')}
                    required={true}
                />
                <FormField
                    theme={theme}
                    onChangeText={(text) => this.setState({ password: text })}
                    label={I18n.get('Password')}
                    placeholder={I18n.get('Enter your new password')}
                    secureTextEntry={true}
                    required={true}
                />
                <AmplifyButton
                    text={I18n.get('Submit')}
                    style={theme.button}
                    onPress={this.submit}
                    disabled={!this.state.username}
                />
            </View>
        )
    }

    showComponent(theme) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={theme.section}>
                    <Header theme={theme}>{I18n.get('Forgot Password')}</Header>
                    <View style={theme.sectionBody}>
                        { !this.state.delivery && this.forgotBody(theme) }
                        { this.state.delivery && this.submitBody(theme) }
                    </View>
                    <View style={theme.sectionFooter}>
                        <LinkCell theme={theme} onPress={() => this.changeState('signIn')}>
                            {I18n.get('Back to Sign In')}
                        </LinkCell>
                    </View>
                    <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
