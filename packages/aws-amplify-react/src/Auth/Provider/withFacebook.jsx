import React, { Component } from 'react';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../../AmplifyTheme';
// import { SignInButton } from '../../AmplifyUI';

import { SignInButton, SignInButtonIcon, SignInButtonContent } from '../../Amplify-UI/Amplify-UI-Components-React';

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
                let user = {
                    name: response.name
                }
                if (!Auth || 
                    typeof Auth.federatedSignIn !== 'function' || 
                    typeof Auth.currentAuthenticatedUser !== 'function') {
                    throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
                }
                
                Auth.federatedSignIn('facebook', { token: accessToken, expires_at }, user)
                .then(credentials => {
                    return Auth.currentAuthenticatedUser();
                }).then(authUser => {
                    if (onStateChange) {
                        onStateChange('signedIn', authUser);
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
        <SignInButtonIcon id="facebook_signin_btn_icon">
            {/* <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><defs><style>{`.cls-1{fill:#fff;}`}</style></defs><title>flogo-HexRBG-Wht-58</title><path class="cls-1" d="M53.85,0H3.15A3.15,3.15,0,0,0,0,3.15v50.7A3.15,3.15,0,0,0,3.15,57h27.3V35H23V26.33h7.41V20c0-7.37,4.49-11.38,11.06-11.38A62.15,62.15,0,0,1,48.15,9v7.69H43.61c-3.57,0-4.26,1.69-4.26,4.18v5.5H47.9L46.79,35H39.35V57h14.5A3.15,3.15,0,0,0,57,53.85V3.15A3.15,3.15,0,0,0,53.85,0Z"/></svg> */}
            {/* <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><defs><style>{`.cls-1{fill:#4267b2;}.cls-2{fill:#fff;}`}</style></defs><title>flogo_RGB_HEX-72</title><path class="cls-1" d="M68,0H4A4,4,0,0,0,0,4V68a4,4,0,0,0,4,4H38.46V44.16H29.11V33.26h9.35v-8c0-9.3,5.68-14.37,14-14.37a77.46,77.46,0,0,1,8.38.43V21H55.1c-4.51,0-5.39,2.15-5.39,5.3v6.94H60.5l-1.4,10.9H49.71V72H68a4,4,0,0,0,4-4V4A4,4,0,0,0,68,0Z"/><path id="f" class="cls-2" d="M49.71,72V44.16H59.1l1.4-10.9H49.71V26.32c0-3.15.88-5.3,5.39-5.3h5.72V11.3a77.46,77.46,0,0,0-8.38-.43c-8.3,0-14,5.07-14,14.37v8H29.11v10.9h9.35V72Z"/></svg>    */}
            <svg viewBox='0 0 279 538' xmlns='http://www.w3.org/2000/svg'><g id='Page-1' fill='none' fillRule='evenodd'><g id='Artboard' fill='#FFF'><path d='M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z'id='Fill-1' /></g></g></svg>
        </SignInButtonIcon>
        <SignInButtonContent>
            Sign In with Facebook
        </SignInButtonContent>
    </SignInButton>
)

export const FacebookButton = withFacebook(Button);
