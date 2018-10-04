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

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../../Amplify-UI/Amplify-UI-Theme';
import auth0 from 'auth0-js';
import { auth0SignInButton } from '@aws-amplify/ui';
import {
    SignInButton,
    SignInButtonIcon,
    SignInButtonContent
} from '../../Amplify-UI/Amplify-UI-Components-React';
import Constants from '../common/constants';


const logger = new Logger('withAuth0');

export default function withAuth0(Comp, options) {
    return class extends Component {
        constructor(props) {
            super(props);
            this._auth0 = null;

            this.initialize = this.initialize.bind(this);
            this.signIn = this.signIn.bind(this);
        }

        componentDidMount() {
            this.initialize();
        }

        initialize() {
            const config = this.props.auth0 || options || Auth.configure().auth0;
            const { onError, onStateChange, authState, onAuthEvent } = this.props;
            if (!config) {
                logger.debug('Auth0 is not configured');
                return;
            }

            logger.debug('withAuth0 configuration', config);

            if (!this._auth0) {
                this._auth0 = new auth0.WebAuth(config);
                window.auth0 = this._auth0;
            }
            
            if (authState !== 'signedIn') {
                this._auth0.parseHash((err, authResult) => {
                    if (err || !authResult) {
                        logger.debug('Failed to parse the url for Auth0', err);
                        return;
                    }
                    const payload = {
                        provider: Constants.AUTH0,
                        opts: {
                            returnTo: config.returnTo,
                            clientID: config.clientID,
                            federated: config.federated
                        }
                    }

                    try {
                        localStorage.setItem(Constants.AUTH_SOURCE_KEY, JSON.stringify(payload));
                    } catch (e) {
                        logger.debug('Failed to cache auth source into localStorage', e);
                    }
              
                    this._auth0.client.userInfo(authResult.accessToken, (err, user) => {
                        let username = undefined;
                        let email = undefined;
                        if (err) {
                            logger.debug('Failed to get the user info', err);
                        } else {
                            username = user.name;
                            email = user.email;
                        }

                        Auth.federatedSignIn(
                            config.domain,
                            {
                                token: authResult.idToken,
                                expires_at: authResult.expiresIn * 1000 + new Date().getTime()
                            },
                            { name: username, email }
                        ).then((cred) => {
                            if (onStateChange) {
                                Auth.currentAuthenticatedUser().then(user => {
                                    onStateChange('signedIn', user);
                                });
                            }
                        }).catch((e) => {
                            logger.debug('Failed to get the aws credentials', e);
                            if (onError) onError(e);
                        });
                    });
                });
            }
        }

        async signIn() {
            if (this._auth0) this._auth0.authorize();
            else {
                return new Error('the auth0 client is not configured');
            }
        }

        render() {
            return <Comp {...this.props} auth0SignIn={this.signIn} />;
        }
    };
}

const Button = props => (
    <SignInButton
        id={auth0SignInButton}
        onClick={props.auth0SignIn}
        theme={props.theme || AmplifyTheme}
        variant={'auth0SignInButton'}
    >
        <SignInButtonIcon theme={props.theme || AmplifyTheme}>
            <svg viewBox="0 0 256 262" xmlns="http://ww0w.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
        </SignInButtonIcon>
        <SignInButtonContent theme={props.theme || AmplifyTheme}>
            {props.label || 'Sign In with Auth0'}
        </SignInButtonContent>
    </SignInButton>
);

export const Auth0Button = withAuth0(Button);
