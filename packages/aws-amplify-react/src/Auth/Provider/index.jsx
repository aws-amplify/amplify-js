import React, { Component } from 'react';

import withGoogle from './withGoogle';
import withFacebook from './withFacebook';
import withAmazon from './withAmazon';
import withHostedCognito from './withHostedCognito';

export { default as withGoogle, GoogleButton } from './withGoogle';
export { default as withFacebook, FacebookButton } from './withFacebook';
export { default as withAmazon, AmazonButton } from './withAmazon';
export { default as withHostedCognito, HostedCognitoButton } from './withHostedCognito';

export function withFederated(Comp) {
    const Federated = withHostedCognito(withAmazon(withGoogle(withFacebook(Comp))));

    return class extends Component {
        render() {
            const federated = this.props.federated || {};
            return (
                <Federated {...this.props} {...federated} />
            )
        }
    }
}
