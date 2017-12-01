import React, { Component } from 'react';

import { Logger, JS } from 'aws-amplify';
import AmplifyTheme from '../AmplifyTheme';
import {
    FormSection,
    SectionBody
} from '../AmplifyUI';
import {
    GoogleButton,
    FacebookButton
} from './Provider';

const logger = new Logger('FederatedSignIn');

export class FederatedButtons extends Component {
    google(google_client_id) {
        if (!google_client_id) { return null; }

        const { onStateChange } = this.props;
        return <GoogleButton
                google_client_id={google_client_id}
                onStateChange={onStateChange}
              />
    }

    facebook(facebook_app_id) {
        if (!facebook_app_id) { return null; }

        const { onStateChange } = this.props;
        return <FacebookButton
                facebook_app_id={facebook_app_id}
                onStateChange={onStateChange}
                />
    }

    render() {
        const { authState } = this.props;
        if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }

        const federated = this.props.federated || {};
        if (JS.isEmpty(federated)) { return null; }

        const { google_client_id, facebook_app_id } = federated;

        const theme = this.props.theme || AmplifyTheme;
        return (
            <div className="amplify-action-row" style={theme.actionRow}>
                {this.google(google_client_id)}
                {this.facebook(facebook_app_id)}
            </div>
        )
    }
}

export default class FederatedSignIn extends Component {
    render() {
        const { federated, authState, onStateChange } = this.props;
        if (!federated) {
            logger.debug('federated prop is empty. show nothing');
            logger.debug('federated={google_client_id: , facebook_app_id: }');
            return null;
        }

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
