import React, { Component } from 'react';

import { Auth, Logger } from 'aws-amplify';
import AmplifyTheme from '../../AmplifyTheme';
import { SignInButton } from '../../AmplifyUI';

const logger = new Logger('withOAuth');

export default function withOAuth(Comp, options) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.signIn = this.signIn.bind(this);
            this.state = {};
        }

        signIn() {
            const config = Auth.configure();
            const { 
                AppWebDomain,  
                RedirectUriSignIn, 
                RedirectUriSignOut,
                ResponseType } = config.hostedUIOptions;
            const clientId = config.userPoolWebClientId;
            const url = 'https://' + AppWebDomain + '/login?redirect_uri=' + RedirectUriSignIn + '&response_type=' + ResponseType + '&client_id=' + clientId;
            window.location.assign(url);            
        }

        render() {
            return (
                <Comp {...this.props} OAuthSignIn={this.signIn} />
            )
        }
    }
}

const Button = (props) => (
    <SignInButton
        id="OAuth_signin_btn"
        onClick={props.OAuthSignIn}
        theme={props.theme || AmplifyTheme}
    >
        {props.label || 'Sign in with AWS'}
    </SignInButton>
)

export const OAuthButton = withOAuth(Button);