import React, { Component } from 'react';

import { Logger, JS, Auth } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import {
    FormSection,
    SectionBody,
    ActionRow
} from '../AmplifyUI';
import {
    GoogleButton,
    FacebookButton,
    AmazonButton,
    HostedCognitoButton
} from './Provider';

const logger = new Logger('FederatedSignIn');

export class FederatedButtons extends Component {
    google(google_client_id) {
        if (!google_client_id) { return null; }

        const { theme, onStateChange } = this.props;
        return <GoogleButton
                google_client_id={google_client_id}
                theme={theme}
                onStateChange={onStateChange}
              />
    }

    facebook(facebook_app_id) {
        if (!facebook_app_id) { return null; }

        const { theme, onStateChange } = this.props;
        return <FacebookButton
                facebook_app_id={facebook_app_id}
                theme={theme}
                onStateChange={onStateChange}
                />
    }

    amazon(amazon_client_id) {
        if (!amazon_client_id) { return null; }

        const { theme, onStateChange } = this.props;
        return <AmazonButton
                amazon_client_id={amazon_client_id}
                theme={theme}
                onStateChange={onStateChange}
              />
    }

    hostedCognito(cognito_auth) {
        if (!cognito_auth) { return null;}
        const { theme, onStateChange } = this.props;
        return <HostedCognitoButton
                label={cognito_auth? cognito_auth.label : undefined}
                theme={theme}
                onStateChange={onStateChange}
              />
    }


    render() {
        const { authState } = this.props;
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }

        const federated = this.props.federated || {};
        const config = Auth.configure();
        if (config.hostedUIOptions) {
            federated.cognito_auth = federated.cognito_auth?
                Object.assign(federated.cognito_auth, config.hostedUIOptions) : config.hostedUIOptions;
        }
        if (JS.isEmpty(federated)) { return null; }

        const { google_client_id, facebook_app_id, amazon_client_id, cognito_auth } = federated;

        const theme = this.props.theme || AmplifyTheme;
        return (
            <ActionRow theme={theme}>
                {this.google(google_client_id)}
                {this.facebook(facebook_app_id)}
                {this.amazon(amazon_client_id)}
                {this.hostedCognito(cognito_auth)}
            </ActionRow>
        )
    }
}

export default class FederatedSignIn extends Component {
    render() {
        
        const { authState, onStateChange } = this.props;
        let federated = this.props.federated || {};
        const config = Auth.configure();
        if (config.hostedUIOptions) {
            federated.cognito_auth = Object.assign(federated.cognito_auth, config.hostedUIOptions);
        }

        if (!federated) {
            logger.debug('federated prop is empty. show nothing');
            logger.debug('federated={google_client_id: , facebook_app_id: , amazon_client_id}');
            return null;
        }
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }
        logger.debug('federated Config is', federated);
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
        )
    }
}
