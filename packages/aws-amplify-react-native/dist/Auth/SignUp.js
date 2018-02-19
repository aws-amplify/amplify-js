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
import { Username, Password, Email, PhoneNumber, LinkCell, Header, ErrorRow } from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('SignUp');

const Footer = props => {
    const { theme, onStateChange } = props;
    return React.createElement(
        View,
        { style: theme.sectionFooter },
        React.createElement(
            LinkCell,
            { theme: theme, onPress: () => onStateChange('confirmSignUp') },
            I18n.get('Confirm a Code')
        ),
        React.createElement(
            LinkCell,
            { theme: theme, onPress: () => onStateChange('signIn') },
            I18n.get('Sign In')
        )
    );
};

export default class SignUp extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['signUp'];
        this.state = {
            username: null,
            password: null,
            email: null,
            phone_number: null
        };

        this.signUp = this.signUp.bind(this);
    }

    signUp() {
        const { username, password, email, phone_number } = this.state;
        logger.debug('Sign Up for ' + username);
        Auth.signUp(username, password, email, phone_number).then(data => {
            logger.debug(data);
            this.changeState('confirmSignUp', username);
        }).catch(err => this.error(err));
    }

    showComponent(theme) {
        return React.createElement(
            View,
            { style: theme.section },
            React.createElement(
                Header,
                { theme: theme },
                I18n.get('Sign Up')
            ),
            React.createElement(
                View,
                { style: theme.sectionBody },
                React.createElement(Username, {
                    theme: theme,
                    onChangeText: text => this.setState({ username: text })
                }),
                React.createElement(Password, {
                    theme: theme,
                    onChangeText: text => this.setState({ password: text })
                }),
                React.createElement(Email, {
                    theme: theme,
                    onChangeText: text => this.setState({ email: text })
                }),
                React.createElement(PhoneNumber, {
                    theme: theme,
                    onChangeText: text => this.setState({ phone_number: text })
                }),
                React.createElement(Button, {
                    title: I18n.get('Sign Up'),
                    onPress: this.signUp,
                    disabled: !this.state.username || !this.state.password
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