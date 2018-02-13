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
import { View, Text, Button } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import AuthPiece from './AuthPiece';

const logger = new Logger('Greetings');

export default class Greetings extends AuthPiece {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        Auth.signOut().then(() => this.changeState('signedOut')).catch(err => this.error(err));
    }

    signedInMessage(username) {
        return 'Hello ' + username;
    }
    signedOutMessage() {
        return 'Please Sign In / Sign Up';
    }

    userGreetings(theme) {
        const user = this.props.authData || this.props.user;
        const message = this.props.signedInMessage || this.signInMessage;
        const greeting = typeof message === 'function' ? message(user.username) : message;
        return React.createElement(
            View,
            { style: theme.navRight },
            React.createElement(
                Text,
                null,
                greeting
            ),
            React.createElement(Button, {
                title: I18n.get('Sign Out'),
                style: theme.navButton,
                onPress: this.signOut
            })
        );
    }

    noUserGreetings(theme) {
        const message = this.props.signedOutMessage || this.signOutMessage;
        const greeting = typeof message === 'function' ? message() : message;
        return React.createElement(
            Text,
            { style: theme.navRight },
            message
        );
    }

    render() {
        const { authState } = this.props;
        const signedIn = authState === 'signedIn';
        const theme = this.props.theme || AmplifyTheme;

        return React.createElement(
            View,
            { style: theme.navBar },
            signedIn ? this.userGreetings(theme) : this.noUserGreetings(theme)
        );
    }
}