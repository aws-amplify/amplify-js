import React, { Component } from 'react';

import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';

const logger = new Logger('withGoogle');

export default function withGoogle(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.initGapi = this.initGapi.bind(this);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {
                ga: null
            }
        }

        signIn() {
            const { ga } = this.state;
            ga.signIn()
                .then(googleUser => this.federatedSignIn(googleUser));
        }

        federatedSignIn(googleUser) {
            const { id_token } = googleUser.getAuthResponse();
            const profile = googleUser.getBasicProfile();
            const user = {
                email: profile.getEmail(),
                name: profile.getName()
            };

            const { onStateChange } = this.props;
            return Auth.federatedSignIn('google', id_token, user)
                .then(crednetials => {
                    if (onStateChange) {
                        onStateChange('signedIn');
                    }
                });
        }

        componentDidMount() {
            this.createScript();
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
                }).then(ga => {
                    that.setState({ ga: ga });
                });
            });
        }

        render() {
            const { ga } = this.state;
            return (
                <Comp {...this.props} ga={ga} googleSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
    <button onClick={props.googleSignIn} style={props.style || AmplifyTheme.providerButton}>
        Google
    </button>
)

export const GoogleButton = withGoogle(Button);
