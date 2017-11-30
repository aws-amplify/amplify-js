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
import { Auth, I18n, Logger, Hub } from 'aws-amplify';

import AuthPiece from './AuthPiece';
import AmplifyTheme from '../AmplifyTheme';

const logger = new Logger('Greetings');

export default class Greetings extends AuthPiece {
    constructor(props) {
        super(props);

        this.signOut = this.signOut.bind(this);
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
        Auth.signOut()
            .then(() => this.changeState('signedOut'))
            .catch(err => { logger.error(err); this.error(err); });
    }

    checkUser() {
        const that = this;
        const { authState } = this.state;
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
        if (channel === 'auth') { this.checkUser(); }
    }

    inGreeting(name) { return 'Hello ' + name; }
    outGreeting() { return 'Please Sign In / Sign Up'; }

    userGreetings(theme) {
        const user = this.state.authData;
        const greeting = this.props.inGreeting || this.inGreeting;
        const name = user.name || user.username;
        const message = (typeof greeting === 'function')? greeting(name) : greeting;
        return (
            <div className="amplify-nav-right" style={theme.navRight}>
                <span>{message}</span>
                <button
                    className="amplify-nav-button"
                    style={theme.navButton}
                    onClick={this.signOut}
                >{I18n.get('Sign Out')}</button>
            </div>
        )
    }

    noUserGreetings(theme) {
        const greeting = this.props.outGreeting || this.outGreeting;
        const message = (typeof greeting === 'function')? greeting() : greeting;
        return <div className="amplify-nav-right" style={theme.navRight}>{message}</div>
    }

    render() {
        const { hide } = this.props;
        const { authState } = this.state;
        const signedIn = (authState === 'signedIn');
        const theme = this.props.theme || AmplifyTheme;

        if (hide && hide.includes(Greetings)) { return null; }

        return (
            <div className="amplify-nav-bar" style={theme.navBar}>
                {signedIn? this.userGreetings(theme) : this.noUserGreetings(theme)}
            </div>
        )
    }
}
