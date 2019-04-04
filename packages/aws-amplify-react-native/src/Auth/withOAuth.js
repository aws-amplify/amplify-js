/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import * as React from 'react';
import { Linking } from "react-native";

import { Logger, Hub } from '@aws-amplify/core';
import { default as Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

const logger = new Logger('withOAuth');

export default (Comp) => {
    let listeners = [];

    return class WithOAuth extends React.Component {
        constructor(props) {
            super(props);

            const config = this._getOAuthConfig();

            const {
                urlOpener = defaultUrlOpener,
            } = config;

            this.urlOpener = urlOpener;

            this.hostedUISignIn = this.hostedUISignIn.bind(this);
            this.signOut = this.signOut.bind(this);
            this._getOAuthUrl = this._getOAuthUrl.bind(this);
            this.urlOpener = this.urlOpener.bind(this);

            this.state = {
                user: null,
                error: null,
            };

            listeners.forEach(listener => Hub.remove('auth', listener));
            listeners = [this];
            this.onHubCapsule = this.onHubCapsule.bind(this);
            Hub.listen('auth', this.onHubCapsule);
        }

        componentDidMount() {
            Linking.getInitialURL().then(url => {
                const config = Auth.configure();

                if (url && config) {
                    Auth.configure(config);
                }
            }).catch(error => {
                logger.debug('componentDidMount [Linking.getInitialURL]', error);
            }).then(() => {
                Auth.currentAuthenticatedUser().then(user => {
                    this.setState({ user })
                }).catch(error => {
                    logger.debug(error);

                    this.setState({ user: null });
                });
            });
        }

        onHubCapsule(capsule) {
            // The Auth module will emit events when user signs in, signs out, etc
            const { channel, payload } = capsule;

            if (channel === 'auth') {
                switch (payload.event) {
                    case 'signIn':
                    case 'cognitoHostedUI': {
                        Auth.currentAuthenticatedUser().then(user => {
                            logger.debug('signed in');

                            this.setState({ user, error: null });
                        });
                        break;
                    }
                    case 'signOut': {
                        logger.debug('signed out');
                        this.setState({ user: null, error: null });
                        break;
                    }
                    case 'signIn_failure':
                    case 'cognitoHostedUI_failure': {
                        logger.debug('not signed in');
                        this.setState({ user: null, error: decodeURIComponent(payload.data) });
                        break;
                    }
                    default:
                        break;
                }
            }
        }

        _getOAuthConfig() {
            if (!Auth || typeof Auth.configure !== 'function') {
                throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
            }

            const { oauth = undefined } = Auth.configure();

            // to keep backward compatibility
            const cognitoHostedUIConfig = oauth && (oauth.domain ? oauth : oauth.awsCognito);
            const config = this.props.oauth_config || cognitoHostedUIConfig;

            return config;
        }

        _getOAuthUrl(provider = CognitoHostedUIIdentityProvider.Cognito) {
            const config = this._getOAuthConfig();

            logger.debug('withOAuth configuration', config);
            const {
                domain,
                redirectSignIn,
                responseType
            } = config;

            const options = config.options || {};
            const url = `https://${domain}/authorize?${
                Object.entries({
                    redirect_uri: redirectSignIn,
                    response_type: responseType,
                    client_id: options.ClientId || Auth.configure().userPoolWebClientId,
                    identity_provider: provider,
                }).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;

            return Promise.resolve(url);
        }

        hostedUISignIn(provider) {
            const config = this._getOAuthConfig();

            logger.debug('withOAuth configuration', config);
            const {
                redirectSignIn,
            } = config;

            return this._getOAuthUrl(provider).then(url => this.urlOpener(url, redirectSignIn));
        }

        signOut() {
            return Auth.signOut().catch(error => logger.warn(error));
        }

        render() {
            const { user: oAuthUser, error: oAuthError } = this.state;
            const { oauth_config: _, ...otherProps } = this.props;

            const oAuthProps = {
                getOAuthUrl: this._getOAuthUrl,
                oAuthUser,
                oAuthError,
                hostedUISignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Cognito),
                facebookSignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Facebook),
                amazonSignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Amazon),
                googleSignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Google),
                customProviderSignIn: provider => this.hostedUISignIn(provider),
                signOut: this.signOut,
            };

            return <Comp {...oAuthProps} {...otherProps} />;
        }
    }
};

const defaultUrlOpener = (url, redirectUrl) => {
    logger.debug(`opening url: ${url}, redirectUrl: ${redirectUrl}`);

    return Linking.openURL(url);
}
