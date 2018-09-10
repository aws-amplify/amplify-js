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
import { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

import AuthPiece from './AuthPiece';
import { NavButton } from '../AmplifyUI';
import AmplifyTheme from '../AmplifyTheme';

const logger = new Logger('SignOut');

export default class SignOut extends AuthPiece {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
        this.googleSignOut = this.googleSignOut.bind(this);
        this.facebookSignOut = this.facebookSignOut.bind(this);
        this.checkUser = this.checkUser.bind(this);
        this.onHubCapsule = this.onHubCapsule.bind(this);

        this.state = {
            authState: props.authState,
            authData: props.authData
        }

        Hub.listen('auth', this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.checkUser();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    signOut() {
        this.googleSignOut();
        this.facebookSignOut();
        if (!Auth || typeof Auth.signOut !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        Auth.signOut()
            .then(() => this.changeState('signedOut'))
            .catch(err => { logger.error(err); this.error(err); });
    }

    googleSignOut() {
        const authInstance = window.gapi && window.gapi.auth2? window.gapi.auth2.getAuthInstance() : null;
        if (!authInstance) {
            return Promise.resolve(null);
        }

        authInstance.then((googleAuth) => {
            if (!googleAuth) {
                logger.debug('google Auth undefined');
                return Promise.resolve(null);
            }

            logger.debug('google signing out');
            return googleAuth.signOut();
        });
    }

    facebookSignOut() {
        const fb = window.FB;
        if (!fb) {
            logger.debug('FB sdk undefined');
            return Promise.resolve(null);
        }

        fb.getLoginStatus(response => {
            if (response.status === 'connected') {
                return new Promise((res, rej) => {
                    logger.debug('facebook signing out');
                    fb.logout(response => {
                        res(response);
                    });
                });
            } else {
                return Promise.resolve(null);
            }
        });
    }

    checkUser() {
        const that = this;
        const { authState } = this.state;
        if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        return Auth.currentAuthenticatedUser()
            .then(user => {
                if (!that._isMounted) { return; }
                if (authState !== 'signedIn') {
                    this.setState({
                        authState: 'signedIn',
                        authData: user
                    });
                    this.changeState('signedIn', user);
                }
            })
            .catch(err => {
                if (!that._isMounted) { return; }
                if (!authState || authState === 'signedIn') {
                    this.setState({ authState: 'signIn' });
                    this.changeState('signIn');
                }
            });
    }

    onHubCapsule(capsule) {
        const { channel, payload, source } = capsule;
        if (channel === 'auth' && (payload.event === 'configured' || payload.event === 'cognitoHostedUI')) { 
            this.checkUser(); 
        }
    }

    render() {
        const { hide } = this.props;
        if (hide && hide.includes(SignOut)) { return null; }

        const { authState } = this.state;
        const signedIn = (authState === 'signedIn');

        const theme = this.props.theme || AmplifyTheme;
        if (!signedIn) { return null; }

        return (
            <NavButton
                theme={theme}
                onClick={this.signOut}
            >{I18n.get('Sign Out')}
            </NavButton>
        )
    }
}
