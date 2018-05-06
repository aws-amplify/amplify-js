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
    OAuthButton
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

    OAuth(oauth_config) {
        if (!oauth_config) { return null;}
        const { theme, onStateChange } = this.props;
        return <OAuthButton
                label={oauth_config? oauth_config.label : undefined}
                theme={theme}
                onStateChange={onStateChange}
              />
    }

    render() {
        const { authState } = this.props;
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }

        const federated = this.props.federated || {};
        const config = Auth.configure();
        if (config.oauth) {
            federated.oauth_config = Object.assign({}, federated.oauth_config, config.oauth);
        }

        if (JS.isEmpty(federated)) { return null; }

        const { google_client_id, facebook_app_id, amazon_client_id, oauth_config } = federated;

        const theme = this.props.theme || AmplifyTheme;
        return (
            <ActionRow theme={theme}>
                {this.google(google_client_id)}
                {this.facebook(facebook_app_id)}
                {this.amazon(amazon_client_id)}
                {this.OAuth(oauth_config)}
            </ActionRow>
        )
    }
}

export default class FederatedSignIn extends Component {
    render() {
        const { authState, onStateChange } = this.props;
        let federated = this.props.federated || {};
        const config = Auth.configure();
        if (config.oauth) {
            federated.oauth_config = Object.assign({}, federated.oauth_config, config.oauth);
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
