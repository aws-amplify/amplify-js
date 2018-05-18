import React, { Component } from 'react';

import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withGoogle');

export default function withGoogle(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.initGapi = this.initGapi.bind(this);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {};
        }

        signIn() {
            const ga = window.gapi.auth2.getAuthInstance();
            const { onError } = this.props;
            ga.signIn().then(
                googleUser => this.federatedSignIn(googleUser),
                error => {
                    if (onError) onError(error);
                    else throw error;
                }
            );
        }

        federatedSignIn(googleUser) {
            const { id_token, expires_at } = googleUser.getAuthResponse();
            const profile = googleUser.getBasicProfile();
            const user = {
                email: profile.getEmail(),
                name: profile.getName()
            };

            const { onStateChange } = this.props;
            return Auth.federatedSignIn(
                'google',
                { token: id_token, expires_at },
                user
            ).then(credentials => {
                if (onStateChange) {
                    onStateChange('signedIn');
                }
            });
        }

        componentDidMount() {
            const { google_client_id } = this.props;
            if (google_client_id) this.createScript();
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

        render() {
            const ga =
                window.gapi && window.gapi.auth2
                    ? window.gapi.auth2.getAuthInstance()
                    : null;
            return <Comp {...this.props} ga={ga} googleSignIn={this.signIn} />;
        }
    };
}

const Button = props => (
    <SignInButton
        id="google_signin_btn"
        onClick={props.googleSignIn}
        theme={props.theme || AmplifyTheme}
    >
        Sign In with Google
    </SignInButton>
);

export const GoogleButton = withGoogle(Button);
