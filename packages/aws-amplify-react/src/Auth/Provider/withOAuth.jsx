import React, { Component } from 'react';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../../Amplify-UI/Amplify-UI-Theme';
import { 
    SignInButton, 
    SignInButtonContent
} from '../../Amplify-UI/Amplify-UI-Components-React';

const logger = new Logger('withOAuth');

export default function withOAuth(Comp, options) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.signIn = this.signIn.bind(this);
        }

        signIn() {
            if (!Auth || typeof Auth.configure !== 'function') {
                throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
            }

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
        <SignInButtonContent>
            {props.label || 'Sign in with AWS'}
        </SignInButtonContent>
    </SignInButton>
)

export const OAuthButton = withOAuth(Button);