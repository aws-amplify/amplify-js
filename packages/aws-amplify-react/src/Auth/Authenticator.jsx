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

import React, { Component } from 'react';
import { Amplify, I18n, ConsoleLogger as Logger } from '@aws-amplify/core';

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

export default class Authenticator extends Component {
    constructor(props) {
        super(props);

        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleAuthEvent = this.handleAuthEvent.bind(this);

        this.state = { auth: props.authState || 'loading' };
    }

    componentWillMount() {
        const config = this.props.amplifyConfig;
        if (config) {
            Amplify.configure(config);
        }
    }

    handleStateChange(state, data) {
        logger.debug('authenticator state change ' + state, data);
        if (state === this.state.auth) { return; }

        if (state === 'signedOut') { state = 'signIn'; }
        this.setState({ auth: state, authData: data, error: null });
        if (this.props.onStateChange) { this.props.onStateChange(state, data); }
    }

    handleAuthEvent(state, event) {
        if (event.type === 'error') {
            const map = this.props.errorMessage || AmplifyMessageMap;
            const message = (typeof map === 'string')? map : map(event.data);
            this.setState({ error: message, showToast: true });
            
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
            <Greetings/>,
            <SignIn federated={federated}/>,
            <ConfirmSignIn/>,
            <RequireNewPassword/>,
            <SignUp/>,
            <ConfirmSignUp/>,
            <VerifyContact/>,
            <ForgotPassword/>,
            <TOTPSetup/>
        ];

        const props_children_names  = React.Children.map(props_children, child => child.type.name)
        hide = hide.filter((component) =>!props_children_names.includes(component.name))
        const render_props_children = React.Children.map(props_children, (child, index) => {
            return React.cloneElement(child, {
                    key: 'aws-amplify-authenticator-props-children-' + index,
                    theme: theme,
                    messageMap: messageMap,
                    authState: auth,
                    authData: authData,
                    onStateChange: this.handleStateChange,
                    onAuthEvent: this.handleAuthEvent,
                    hide: hide
                });
        });
       
        const render_default_children = hideDefault ? [] : React.Children.map(default_children, (child, index) => {
                return React.cloneElement(child, {
                    key: 'aws-amplify-authenticator-default-children-' + index,
                    theme: theme,
                    messageMap: messageMap,
                    authState: auth,
                    authData: authData,
                    onStateChange: this.handleStateChange,
                    onAuthEvent: this.handleAuthEvent,
                    hide: hide
                });
            });

        const render_children = render_default_children.concat(render_props_children);
        const error = this.state.error;        

        return (
            <Container theme={theme}>
                {this.state.showToast && 
                    <Toast onClose={() => this.setState({showToast: false})}>
                        { I18n.get(error) }
                    </Toast>
                }
                {render_children}
            </Container>
        )
    }
}
