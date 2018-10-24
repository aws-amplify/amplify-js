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
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AuthPiece from './AuthPiece';
import { NavBar, Nav, NavRight, NavItem, NavButton } from '../Amplify-UI/Amplify-UI-Components-React';
import { withGoogle, withAmazon, withFacebook, withOAuth } from './Provider';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import Constants from './common/constants';
import SignOut from './SignOut';

const logger = new Logger('Greetings');

export default class Greetings extends AuthPiece {
    constructor(props) {
        super(props);
    
        this.state = {
            authState: props.authState,
            authData: props.authData
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    inGreeting(name) { return 'Hello ' + name; }
    outGreeting() { return ''; }


    userGreetings(theme) {
        const user = this.state.authData;
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
                <SignOut {...this.props} />
            </span>
        )
    }

    noUserGreetings(theme) {
        const greeting = this.props.outGreeting || this.outGreeting;
        const message = (typeof greeting === 'function')? greeting() : greeting;
        return message? <NavItem theme={theme}>{message}</NavItem> : null;
    }

    render() {
        const { hide } = this.props;
        if (hide && hide.includes(Greetings)) { return null; }

        const { authState } = this.state;
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
        )
    }
}
