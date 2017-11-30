import React, { Component } from 'react';

import withGoogle from './withGoogle';
import withFacebook from './withFacebook';

export { default as withGoogle, GoogleButton } from './withGoogle';
export { default as withFacebook, FacebookButton } from './withFacebook';

export function withFederated(Comp) {
    const Federated = withGoogle(withFacebook(Comp));

    return class extends Component {
        render() {
            const federated = this.props.federated || {};
            return (
                <Federated {...this.props} {...federated} />
            )
        }
    }
}
