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
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Auth, Analytics, Logger, Hub } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import AmplifyMessageMap from '../AmplifyMessageMap';
import Loading from './Loading';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import VerifyContact from './VerifyContact';
import SignUp from './SignUp';
import ConfirmSignUp from './ConfirmSignUp';
import ForgotPassword from './ForgotPassword';
import RequireNewPassword from './RequireNewPassword';
import Greetings from './Greetings';

const logger = new Logger('Authenticator');

class AuthDecorator {
    constructor(onStateChange) {
        this.onStateChange = onStateChange;
    }

    signIn(username, password) {
        const that = this;
        return Auth.signIn(username, password).then(data => {
            that.onStateChange('signedIn');
            return data;
        });
    }

    signOut() {
        const that = this;
        return Auth.signOut().then(() => {
            that.onStateChange('signedOut');
        });
    }
}

export default class Authenticator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authState: props.authState || 'loading',
            authData: props.authData
        };

        this.handleStateChange = this.handleStateChange.bind(this);
        this.checkUser = this.checkUser.bind(this);
        this.onHubCapsule = this.onHubCapsule.bind(this);

        Hub.listen('auth', this);
    }

    componentWillMount() {
        this.checkUser();
    }

    onHubCapsule(capsule) {
        const { channel, payload, source } = capsule;
        if (channel === 'auth') {
            this.checkUser();
        }
    }

    handleStateChange(state, data) {
        logger.debug('authenticator state change ' + state);
        if (state === this.state.authState) {
            return;
        }

        if (state === 'signedOut') {
            state = 'signIn';
        }
        this.setState({ authState: state, authData: data, error: null });
        if (this.props.onStateChange) {
            this.props.onStateChange(state, data);
        }

        switch (state) {
            case 'signedIn':
                Analytics.record('_userauth.sign_in');
                break;
            case 'signedUp':
                Analytics.record('_userauth.sign_up');
                break;
        }
    }

    checkUser() {
        const { authState } = this.state;
        const statesJumpToSignIn = ['signedIn', 'signedOut', 'loading'];
        Auth.currentAuthenticatedUser().then(user => {
            if (user) {
                this.handleStateChange('signedIn', null);
            } else {
                if (statesJumpToSignIn.includes(authState)) this.handleStateChange('signIn', null);
            }
        }).catch(err => {
            if (statesJumpToSignIn.includes(authState)) this.handleStateChange('signIn', null);
            logger.debug(err);
        });
    }

    render() {
        const { authState, authData } = this.state;
        const theme = this.props.theme || AmplifyTheme;
        const messageMap = this.props.errorMessage || AmplifyMessageMap;

        const { hideDefault, federated } = this.props;
        const props_children = this.props.children || [];
        const default_children = [React.createElement(Loading, null), React.createElement(SignIn, { federated: federated }), React.createElement(ConfirmSignIn, null), React.createElement(VerifyContact, null), React.createElement(SignUp, null), React.createElement(ConfirmSignUp, null), React.createElement(ForgotPassword, null), React.createElement(RequireNewPassword, null), React.createElement(Greetings, null)];
        const children = (hideDefault ? [] : default_children).concat(props_children).map((child, index) => {
            return React.cloneElement(child, {
                key: 'auth_piece_' + index,
                theme: theme,
                messageMap: messageMap,
                authState: authState,
                authData: authData,
                onStateChange: this.handleStateChange,
                Auth: new AuthDecorator(this.handleStateChange)
            });
        });
        return React.createElement(
            TouchableWithoutFeedback,
            { onPress: Keyboard.dismiss, accessible: false },
            React.createElement(
                View,
                { style: theme.container },
                children
            )
        );
    }
}