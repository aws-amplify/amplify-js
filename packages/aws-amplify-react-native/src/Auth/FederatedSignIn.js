import React, { Component } from 'react';

import { Logger, JS } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import { FormSection, SectionBody, ActionRow } from '../AmplifyUI';
import { AmplifyGoogleSignIn } from 'react-native-aws-amplify-google-signin';
import { FacebookButton } from './Provider';

const logger = new Logger('FederatedSignIn');

export class FederatedButtons extends Component {

     facebook(facebook_app_id) {
         console.log('FACEBOOK LOGIN FACEBOOK ID HMN', facebook_app_id);
         if (!facebook_app_id) {
             return null;
         }

         const { theme, onStateChange } = this.props;
         return <FacebookButton
             facebook_app_id= {facebook_app_id}
             theme= {theme}
             onStateChange= {onStateChange}
         />
    }

    google(google_web_client_id, google_ios_client_id) {
        if (!google_web_client_id && !google_ios_client_id) {
            return null;
        }

        const { theme, onStateChange } = this.props;
        return <AmplifyGoogleSignIn.GoogleButton
                google_ios_client_id={google_ios_client_id}
                google_web_client_id={google_web_client_id}
                theme={theme}
                onStateChange={onStateChange}
                />
    }

    render() {
        const { authState } = this.props;
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
            return null;
        }

        const federated = this.props.federated || {};
        if (JS.isEmpty(federated)) {
            return null;
        }

        const { google_web_client_id, google_ios_client_id, facebook_app_id } = federated;

        const theme = this.props.theme || AmplifyTheme;
        return (
            <ActionRow theme={theme}>
            {this.google(google_web_client_id, google_ios_client_id)}
            {this.facebook(facebook_app_id)}
            </ActionRow>
            );
    }
}

export default class FederatedSignIn extends Component {
    render() {
        const { federated, authState, onStateChange } = this.props;
        if (!federated) {
            logger.debug('federated prop is empty. show nothing');
            return null;
        }
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
            return null;
        }
        console.log('FACEBOOK /Google LOGIN FACEBOOK ID signin render');
        const theme = this.props.theme || AmplifyTheme;
        return (
            <FormSection theme={theme}>
                <SectionBody theme={theme}>
                    <FederatedButtons
                        federated={federated}
                        theme={theme}
                        authState={authState}
                        onStateChange={onStateChange}
                    />
                </SectionBody>
            </FormSection>
        );
    }
} 