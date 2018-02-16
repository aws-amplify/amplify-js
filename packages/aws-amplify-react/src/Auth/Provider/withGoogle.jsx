import React, { Component } from 'react';

import { Auth, Logger, Hub } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withGoogle');
const dispatchAuthEvent = (event, data) => {
    Hub.dispatch('auth', { event, data }, 'Auth');
};

export default function withGoogle(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.initGapi = this.initGapi.bind(this);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);
            this.refreshGoogleToken = this.refreshGoogleToken.bind(this);

            this.state = {};
        }

        signIn() {
            const ga = window.gapi.auth2.getAuthInstance();
            ga.signIn()
                .then(googleUser => this.federatedSignIn(googleUser));
        }

        federatedSignIn(googleUser) {
            const { id_token, expires_at } = googleUser.getAuthResponse();
            const profile = googleUser.getBasicProfile();
            const user = {
                email: profile.getEmail(),
                name: profile.getName()
            };

            dispatchAuthEvent('signIn', user);
            const { onStateChange } = this.props;
            return Auth.federatedSignIn('google', { token: id_token, expires_at }, user)
                .then(crednetials => {
                    if (onStateChange) {
                        onStateChange('signedIn');
                    }
                });
        }

        componentDidMount() {
            const refreshInterval = 25 * 60 * 1000; // 25min
            this.createScript();
            const that = this;
            window.setInterval(() => {
                that.refreshGoogleToken();
            }, refreshInterval);
        }

        createScript() {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/platform.js';
            script.async = true;
            script.onload = this.initGapi;
            document.body.appendChild(script);
        }

        initGapi() {
            logger.debug('init gapi');

            const that = this;
            const { google_client_id } = this.props;
            const g = window.gapi;
            g.load('auth2', function() {
                g.auth2.init({
                    client_id: google_client_id,
                    scope: 'profile email openid'
                });
            });
        }

        refreshGoogleToken() {
            const ga = window.gapi && window.gapi.auth2 ? window.gapi.auth2 : null;
            if (!ga) {
                logger.debug('no gapi auth2 available');
                return Promise.resolve();
            }

            ga.getAuthInstance().then((googleAuth) => {
                if (!googleAuth) {
                    console.log('google Auth undefiend');
                    return Promise.resolve();
                }

                const googleUser = googleAuth.currentUser.get();
                // refresh the token
                if (googleUser.isSignedIn()) {
                    logger.debug('refreshing the google access token')
                    googleUser.reloadAuthResponse()
                        .then((authResponse) => {
                            const { id_token, expires_at } = authResponse;
                            const profile = googleUser.getBasicProfile();
                            const user = {
                                email: profile.getEmail(),
                                name: profile.getName()
                            };

                            return Auth.federatedSignIn('google', { token: id_token, expires_at }, user);
                        });
                }
            });
        }

        render() {
            const ga = (window.gapi && window.gapi.auth2) ? window.gapi.auth2.getAuthInstance() : null;
            return (
                <Comp {...this.props} ga={ga} googleSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
    <SignInButton
        id="google_signin_btn"
        onClick={props.googleSignIn}
        theme={props.theme || AmplifyTheme}
    >
        Sign In with Google
    </SignInButton>
)

export const GoogleButton = withGoogle(Button);
