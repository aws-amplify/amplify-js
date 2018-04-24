var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import React, { Component } from 'react';

import { AmplifyGoogleSignIn } from 'react-native-aws-amplify-google-signin';
// import withFacebook from './withFacebook';
// import withAmazon from './withAmazon';

//export { default as withGoogle, GoogleButton } from 'react-native-aws-amplify-google-signin';
// export { default as withFacebook, FacebookButton } from './withFacebook';
// export { default as withAmazon, AmazonButton } from './withAmazon';

export function withFederated(Comp) {
    const Federated = AmplifyGoogleSignIn.withGoogle(Comp);

    return class extends Component {
        render() {
            const federated = this.props.federated || {};
            return React.createElement(Federated, _extends({}, this.props, federated));
        }
    };
}