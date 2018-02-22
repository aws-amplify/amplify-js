import React, { Component } from 'react';

import withFacebook from './withFacebook';
import withGoogle from './withGoogle';

export { default as withFacebook, FacebookButton } from './withFacebook';
export { default as withGoogle, GoogleButton } from './withGoogle';

export function withFederated(Comp) {
    const Federated = withFacebook(withGoogle(Comp));

    return class extends Component {
        render() {
            const federated = this.props.federated || {};
            return (
                <Federated {...this.props} {...federated} />
            )
        }
    }
}
