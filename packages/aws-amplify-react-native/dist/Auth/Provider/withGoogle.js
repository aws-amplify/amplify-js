var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import React, { Component } from 'react';

import Expo from 'expo';
import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withGoogle');

export default function withGoogle(Comp) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.signIn = this.signIn.bind(this);
            this.federatedSignIn = this.federatedSignIn.bind(this);

            this.state = {};
        }

        async signIn() {
            const { google_android_client_id, google_ios_client_id } = this.props;
            try {
                const result = await Expo.Google.logInAsync({
                    androidClientId: google_android_client_id,
                    iosClientId: google_ios_client_id,
                    scopes: ['profile', 'email']
                });

                if (result.type === 'success') {
                    alert(`Logged in! and access tokin is ${result.accessToken}`);
                    //return result.accessToken;
                    this.federatedSignIn(result);
                } else {
                    return { cancelled: true };
                }
            } catch (e) {
                return { error: true };
            }
        }

        federatedSignIn(googleUser) {
            const accessToken = googleUser.accessToken;
            const date = new Date();
            const expires_at = date.getTime() + 3600;
            console.log('GOOGLE ACCESSTOK', accessToken);
            const profile = googleUser.user;
            console.log('GOOGLE USER DEETS', profile);
            const user = {
                email: profile.email,
                name: profile.name
            };
            console.log('AND WE GET USER AS', user);

            const { onStateChange } = this.props;
            return Auth.federatedSignIn('google', { token: accessToken, expires_at }, user).then(crednetials => {
                console.log('GOOGLE CREDS HERE', crednetials);
                if (onStateChange) {
                    console.log('final google godamn user signin hmm');
                    onStateChange('signedIn');
                }
            });
        }

        render() {
            return React.createElement(Comp, _extends({}, this.props, { googleSignIn: this.signIn }));
        }
    };
}

const Button = props => React.createElement(SignInButton, {
    id: 'google_signin_btn',
    onPress: props.googleSignIn,
    theme: props.theme || AmplifyTheme,
    title: 'googs signin bouy'
});

export const GoogleButton = withGoogle(Button);