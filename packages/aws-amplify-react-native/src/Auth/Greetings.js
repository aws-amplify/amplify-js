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
    Text, 
    Button 
} from 'react-native';
import {
    Auth,
    I18n,
    Logger
} from 'aws-amplify';
import { AmplifyButton } from '../AmplifyUI';
import AmplifyTheme from '../AmplifyTheme';
import AuthPiece from './AuthPiece';

const logger = new Logger('Greetings');

export default class Greetings extends AuthPiece {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        Auth.signOut()
            .then(() => this.changeState('signedOut'))
            .catch(err => this.error(err));
    }

    render() {
        const { authState } = this.props;
        const signedIn = (authState === 'signedIn');
        const theme = this.props.theme || AmplifyTheme;

        let defaultMessage = "";
        if (Auth.user && Auth.user.username) {
            defaultMessage = "Hello, " + Auth.user.username;
        }

        let message;
        if (signedIn) {
            message = this.props.signedInMessage || defaultMessage;
        } else {
            message = this.props.signedOutMessage || "Please Sign In / Sign Up";
        }

        const content = signedIn ? (
            <View style={theme.navBar}>
                <Text>{message}</Text>
                <AmplifyButton
                    text={I18n.get('Sign Out')}
                    onPress={this.signOut}
                    style={theme.navButton}
                />
            </View>
        ) : (
            <Text>{message}</Text>
        );

        return content;
    }
}
