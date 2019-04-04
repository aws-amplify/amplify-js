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

import * as React from 'react';
import { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import { NavBar, Nav, NavRight, NavItem, NavButton } from '../Amplify-UI/Amplify-UI-Components-React';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import Constants from './common/constants';
import SignOut from './SignOut';
import { withGoogle, withAmazon, withFacebook, withOAuth, withAuth0 } from './Provider';

const logger = new Logger('Greetings');

export default class Greetings extends AuthPiece {
    constructor(props) {
        super(props);
        this.state = {};
        this.onHubCapsule = this.onHubCapsule.bind(this);
        Hub.listen('auth', this.onHubCapsule);
        this._validAuthStates = ['signedIn'];

    }

    componentDidMount() {
        this._isMounted = true;
        this.findState();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    
    findState(){
        if (!this.props.authState && !this.props.authData) {
            Auth.currentAuthenticatedUser()
            .then(user => {
                this.setState({
                    authState: 'signedIn',
                    authData: user,
                    stateFromStorage: true
                })
            })
            .catch(err => logger.debug(err));
        }
    }

    onHubCapsule(capsule) {
        if (this._isMounted) {
            const { channel, payload, source } = capsule;
            if (channel === 'auth' && payload.event === 'signIn') {
                this.setState({
                    authState: 'signedIn',
                    authData: payload.data
                })
                if  (!this.props.authState) {
                    this.setState({stateFromStorage: true})
                }
            } else if (channel === 'auth' && payload.event === 'signOut' && (!this.props.authState)) {
                this.setState({
                    authState: 'signIn'
                });
            } 
        }
    }

    inGreeting(name) { return `${I18n.get('Hello')} ${name}`; }
    outGreeting() { return ''; }


    userGreetings(theme) {
        const user = this.props.authData || this.state.authData;
        const greeting = this.props.inGreeting || this.inGreeting;
        // get name from attributes first
        const nameFromAttr = user.attributes? 
            (user.attributes.name || 
            (user.attributes.given_name? 
                (user.attributes.given_name + ' ' + user.attributes.family_name) : undefined))
            : undefined;

        const name = nameFromAttr || user.name || user.username;
        const message = (typeof greeting === 'function')? greeting(name) : greeting;
        const { federated } = this.props;

        return (
            <span>
                <NavItem theme={theme}>{message}</NavItem>
                {this.renderSignOutButton(theme)}
            </span>
        );
    }

    renderSignOutButton() {
        const { federated={} } = this.props;
        const { google_client_id, facebook_app_id, amazon_client_id, auth0 } = federated;
        const config = Auth.configure();
        const { oauth={} } = config;
        const googleClientId = google_client_id || config.googleClientId;
        const facebookAppId = facebook_app_id || config.facebookClientId;
        const amazonClientId = amazon_client_id || config.amazonClientId;
        const auth0_config = auth0 || oauth.auth0;

        if (googleClientId) SignOut = withGoogle(SignOut);
        if (facebookAppId) SignOut = withFacebook(SignOut);
        if (amazonClientId) SignOut = withAmazon(SignOut);
        if (auth0_config) SignOut = withAuth0(SignOut);

        const stateAndProps = Object.assign({}, this.props, this.state);

        return <SignOut 
            {...stateAndProps} 
            />;
    }

    noUserGreetings(theme) {
        const greeting = this.props.outGreeting || this.outGreeting;
        const message = (typeof greeting === 'function')? greeting() : greeting;
        return message? <NavItem theme={theme}>{message}</NavItem> : null;
    }

    render() {
        const { hide } = this.props;
        if (hide && hide.includes(Greetings)) { return null; }

        const authState  = this.props.authState || this.state.authState;
        const signedIn = (authState === 'signedIn');

        const theme = this.props.theme || AmplifyTheme;
        const greeting = signedIn? this.userGreetings(theme) : this.noUserGreetings(theme);
        if (!greeting) { return null; }

        return (
            <NavBar theme={theme}>
                <Nav theme={theme}>
                    <NavRight theme={theme}>
                        {greeting}
                    </NavRight>
                </Nav>
            </NavBar>
        );
    }
}
