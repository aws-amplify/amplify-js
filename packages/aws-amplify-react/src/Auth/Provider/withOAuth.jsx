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
        }

        signIn() {
            const config = this.props.oauth_config || options || Auth.configure().oauth;
            logger.debug('withOAuth configuration', config);
            const { 
                domain,  
                redirectSignIn,
                redirectSignOut,
                responseType
            } = config;

            const options = config.options || {};
            const url = 'https://' + domain 
                + '/login?redirect_uri=' + redirectSignIn 
                + '&response_type=' + responseType 
                + '&client_id=' + (options.ClientId || Auth.configure().userPoolWebClientId);
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