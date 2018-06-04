import React, { Component } from 'react';

import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withFacebook');

export default function withFacebook(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.fbAsyncInit = this.fbAsyncInit.bind(this);
            this.initFB = this.initFB.bind(this);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {};
        }

        signIn() {
            const fb = window.FB;

            fb.getLoginStatus(response => {
                if (response.status === 'connected') {
                    this.federatedSignIn(response.authResponse);
                } else {
                    fb.login(response => {
                        if (!response || !response.authResponse) {
                            return;
                        }
                        this.federatedSignIn(response.authResponse);
                    }, {scope: 'public_profile,email'});
                }
            });
        }

        federatedSignIn(response) {
            logger.debug(response);
            const { onStateChange } = this.props;

            const { accessToken, expiresIn } = response;
            const date = new Date();
            const expires_at = expiresIn * 1000 + date.getTime();
            if (!accessToken) {
                return;
            }

            const fb = window.FB;
            fb.api('/me', response => {
                const user = {
                    name: response.name
                }

                Auth.federatedSignIn('facebook', { token: accessToken, expires_at }, user)
                    .then(credentials => {
                        if (onStateChange) {
                            onStateChange('signedIn');
                        }
                    });
            });
        }

        componentDidMount() {
            const { facebook_app_id } = this.props;
            if (facebook_app_id) this.createScript();
        }

        fbAsyncInit() {
            logger.debug('init FB');

            const { facebook_app_id } = this.props;
            const fb = window.FB;
            fb.init({
                appId   : facebook_app_id,
                cookie  : true,
                xfbml   : true,
                version : 'v2.11'
            });

            fb.getLoginStatus(response => logger.debug(response));
        }

        initFB() {
            const fb = window.FB;
            logger.debug('FB inited');
        }

        createScript() {
            window.fbAsyncInit = this.fbAsyncInit;

            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.onload = this.initFB;
            document.body.appendChild(script);
        }

        render() {
            const fb = window.FB;
            return (
                <Comp {...this.props} fb={fb} facebookSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
    <SignInButton
        id="facebook_signin_btn"
        onClick={props.facebookSignIn}
        theme={props.theme || AmplifyTheme}
    >
        Sign In with Facebook
    </SignInButton>
)

export const FacebookButton = withFacebook(Button);
