/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { Component } from 'react';
import Amplify, { I18n, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import Greetings from './Greetings';
import SignIn from './SignIn';
import ConfirmSignIn from './ConfirmSignIn';
import RequireNewPassword from './RequireNewPassword';
import SignUp from './SignUp';
import ConfirmSignUp from './ConfirmSignUp';
import VerifyContact from './VerifyContact';
import ForgotPassword from './ForgotPassword';
import TOTPSetup from './TOTPSetup';

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import AmplifyMessageMap from '../AmplifyMessageMap';

import { Container, Toast } from '../Amplify-UI/Amplify-UI-Components-React';

const logger = new Logger('Authenticator');
const AUTHENTICATOR_AUTHSTATE = 'amplify-authenticator-authState';

export default class Authenticator extends Component {
    constructor(props) {
        super(props);

        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleAuthEvent = this.handleAuthEvent.bind(this);
        this.onHubCapsule = this.onHubCapsule.bind(this);

        this._initialAuthState = this.props.authState || 'signIn';
        this.state = { auth: 'loading' };
        Hub.listen('auth', this);
    }

    componentDidMount() {
        const config = this.props.amplifyConfig;
        if (config) {
            Amplify.configure(config);
        }
        this._isMounted = true;
        this.checkUser();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    checkUser() {
        const { auth } = this.state;
        if (!Auth || typeof Auth.currentAuthenticatedUser !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        return Auth.currentAuthenticatedUser()
            .then(user => {
                if (!this._isMounted) { return; }
                if (auth !== 'signedIn') {
                    this.setState({
                        authState: 'signedIn',
                        authData: user
                    });
                    this.handleStateChange('signedIn', user);
                }
            })
            .catch(err => {
                if (!this._isMounted) { return; }
                let cachedAuthState = null;
                try {
                    cachedAuthState = localStorage.getItem(AUTHENTICATOR_AUTHSTATE);
                } catch (e) {
                    logger.debug('Failed to get the auth state from local storage', e);
                }
                const promise = cachedAuthState === 'signedIn'? Auth.signOut() : Promise.resolve();
                promise.then(() => this.handleStateChange(this._initialAuthState))
                    .catch((e) => {
                        logger.debug('Failed to sign out', e);
                    });
            });
    }

    onHubCapsule(capsule) {
        const { channel, payload, source } = capsule;
        if (channel === 'auth' && (payload.event === 'configured' || payload.event === 'cognitoHostedUI')) { 
            this.checkUser(); 
        }
    }

    handleStateChange(state, data) {
        logger.debug('authenticator state change ' + state, data);
        if (state === this.state.auth) { return; }

        if (state === 'signedOut') { state = 'signIn'; }
        try {
            localStorage.setItem(AUTHENTICATOR_AUTHSTATE, state);
        } catch (e) {
            logger.debug('Failed to set the auth state into local storage', e);
        }
        this.setState({ auth: state, authData: data, error: null, showToast: false });
        if (this.props.onStateChange) { this.props.onStateChange(state, data); }
    }

    handleAuthEvent(state, event, showToast = true) {
        if (event.type === 'error') {
            const map = this.props.errorMessage || AmplifyMessageMap;
            const message = (typeof map === 'string')? map : map(event.data);
            this.setState({ error: message, showToast });
            
        }
    }

    render() {
        const { auth, authData } = this.state;
        const theme = this.props.theme || AmplifyTheme;
        const messageMap = this.props.errorMessage || AmplifyMessageMap;

        let { hideDefault, hide = [], federated } = this.props;
        if (hideDefault) {
            hide = hide.concat([
                Greetings,
                SignIn,
                ConfirmSignIn,
                RequireNewPassword,
                SignUp,
                ConfirmSignUp,
                VerifyContact,
                ForgotPassword,
                TOTPSetup
            ]);
        }
        const props_children = this.props.children || [];

        const default_children = [
            <Greetings federated={federated}/>,
            <SignIn federated={federated}/>,
            <ConfirmSignIn/>,
            <RequireNewPassword/>,
            <SignUp/>,
            <ConfirmSignUp/>,
            <VerifyContact/>,
            <ForgotPassword/>,
            <TOTPSetup/>
        ];

        const props_children_names  = React.Children.map(props_children, child => child.type.name);
        const props_children_override =  React.Children.map(props_children, child => child.props.override);
        hide = hide.filter((component) =>!props_children_names.includes(component.name));
        const hideLink = hide.filter((component) => {
            return !props_children_override.some(comp => comp === component);
        });
        
        const render_props_children = React.Children.map(props_children, (child, index) => {
            return React.cloneElement(child, {
                    key: 'aws-amplify-authenticator-props-children-' + index,
                    theme,
                    messageMap,
                    authState: auth,
                    authData,
                    onStateChange: this.handleStateChange,
                    onAuthEvent: this.handleAuthEvent,
                    hide: hide,
                    hideLink: hideLink
                });
        });
       
        const render_default_children = hideDefault ? [] : React.Children.map(default_children, (child, index) => {
                return React.cloneElement(child, {
                    key: 'aws-amplify-authenticator-default-children-' + index,
                    theme,
                    messageMap,
                    authState: auth,
                    authData,
                    onStateChange: this.handleStateChange,
                    onAuthEvent: this.handleAuthEvent,
                    hide: hide,
                    hideLink: hideLink
                });
            });

        const render_children = render_default_children.concat(render_props_children);
        const error = this.state.error;        

        return (
            <Container theme={theme}>
                {this.state.showToast && 
                    <Toast theme={theme} onClose={() => this.setState({showToast: false})}>
                        { I18n.get(error) }
                    </Toast>
                }
                {render_children}
            </Container>
        );
    }
}
