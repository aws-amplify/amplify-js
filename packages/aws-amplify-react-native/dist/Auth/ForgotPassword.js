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
import { View, Text, TextInput, Button, TouchableHighlight } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import { Username, Password, ConfirmationCode, LinkCell, Header, ErrorRow } from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('ForgotPassword');

const Footer = props => {
    const { theme, onStateChange } = props;
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
        Auth.forgotPassword(username).then(data => {
            logger.debug(data);
            this.setState({ delivery: data.CodeDeliveryDetails });
        }).catch(err => this.error(err));
    }

    submit() {
        const { username, code, password } = this.state;
        Auth.forgotPasswordSubmit(username, code, password).then(data => {
            logger.debug(data);
            this.changeState('signIn');
        }).catch(err => this.error(err));
    }

    forgotBody(theme) {
        return React.createElement(
            View,
            { style: theme.sectionBody },
            React.createElement(Username, {
                theme: theme,
                onChangeText: text => this.setState({ username: text })
            }),
            React.createElement(Button, {
                title: 'Send Code',
                style: theme.button,
                onPress: this.send,
                disabled: !this.state.username
            })
        );
    }

    submitBody(theme) {
        return React.createElement(
            View,
            { style: theme.sectionBody },
            React.createElement(ConfirmationCode, {
                theme: theme,
                onChangeText: text => this.setState({ code: text })
            }),
            React.createElement(Password, {
                theme: theme,
                placeholder: 'New Password',
                onChangeText: text => this.setState({ password: text })
            }),
            React.createElement(Button, {
                title: I18n.get('Submit'),
                style: theme.button,
                onPress: this.submit,
                disabled: !this.state.username
            })
        );
    }

    showComponent(theme) {
        return React.createElement(
            View,
            { style: theme.section },
            React.createElement(
                Header,
                { theme: theme },
                I18n.get('Forgot Password')
            ),
            React.createElement(
                View,
                { style: theme.sectionBody },
                !this.state.delivery && this.forgotBody(theme),
                this.state.delivery && this.submitBody(theme)
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