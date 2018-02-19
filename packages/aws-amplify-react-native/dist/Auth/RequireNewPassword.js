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
import { View, Text, TextInput, Button } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import { Password, LinkCell, Header, ErrorRow } from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('SignIn');

const Footer = props => {
    const theme = props.theme || AmplifyTheme;
    return React.createElement(
        View,
        { style: theme.sectionFooter },
        React.createElement(
            LinkCell,
            { theme: theme, onPress: () => onStateChange('signIn') },
            I18n.get('Back to Sign In')
        )
    );
};

export default class RequireNewPassword extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['requireNewPassword'];
        this.state = {
            password: null,
            error: null
        };

        this.change = this.change.bind(this);
    }

    change() {
        const user = this.props.authData;
        const { password } = this.state;
        logger.debug('Require new password for ' + user.username);
        Auth.completeNewPassword(user, password, user.challengeParam.requiredAttributes).then(data => {
            if (user.challengeName === 'SMS_MFA') {
                this.changeState('confirmSignIn', user);
            } else {
                this.changeState('signedIn');
            }
        }).catch(err => this.error(err));
    }

    showComponent(theme) {
        return React.createElement(
            View,
            { style: theme.section },
            React.createElement(
                Header,
                { theme: theme },
                I18n.get('Confirm Sign In')
            ),
            React.createElement(
                View,
                { style: theme.sectionBody },
                React.createElement(Password, {
                    theme: theme,
                    onChangeText: text => this.setState({ password: text })
                }),
                React.createElement(Button, {
                    title: I18n.get('Change Password'),
                    onPress: this.change,
                    disabled: !this.state.password
                })
            ),
            React.createElement(Footer, { theme: theme, onStateChange: this.changeState }),
            React.createElement(
                ErrorRow,
                { theme: theme },
                this.state.error
            )
        );
    }
}