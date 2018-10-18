/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import {
    ConsoleLogger as Logger,
} from '../Logger';
import JS from '../JS';

const logger = new Logger('GoogleOAuth');

export default class GoogleOAuth {
    public initialized = false;
    private _waitForInit;
    private _config;

    constructor() {
        this.refreshGoogleToken = this.refreshGoogleToken.bind(this);
        this._refreshGoogleTokenImpl = this._refreshGoogleTokenImpl.bind(this);
        this._initGapi = this._initGapi.bind(this);
        this._config = {};
        this._waitForInit = new Promise((res, rej) => {
            if (!JS.browserOrNode().isBrowser) {
                logger.debug('not in the browser, directly resolved');
                return res();
            }
            const ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;
            if (ga) {
                logger.debug('google api already loaded');
                return res();
            } else {
                setTimeout(
                    () => {
                        return res();
                    }, 
                    2000
                );
            }
        });
    }

    private _initGapi() {
        logger.debug('init gapi');
        const g = window['gapi'];
        const { googleClientId } = this._config;
        g.load('auth2', function() {
            g.auth2.init({
                client_id: googleClientId,
                scope: 'profile email openid'
            });
        });
    }

    private _createScript() {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/platform.js';
        script.async = true;
        script.onload = this._initGapi;
        document.body.appendChild(script);
    }

    public configure(options?) {
        if (!options) return this._config;
        this._config = { ...this._config, ...options };
        if (JS.browserOrNode().isBrowser && !window['gapi'] && this._config.googleClientId) this._createScript();
        return this._config;
    }

    public async refreshGoogleToken() {
        if (!this.initialized) {
            logger.debug('need to wait for the Google SDK loaded');
            await this._waitForInit;
            this.initialized = true;
            logger.debug('finish waiting');
        }

        return this._refreshGoogleTokenImpl();
    }

    private _refreshGoogleTokenImpl() {
        let ga = null;
        if (JS.browserOrNode().isBrowser) ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;
        if (!ga) {
            logger.debug('no gapi auth2 available');
            return Promise.reject('no gapi auth2 available');
        }

        return new Promise((res, rej) => {
            ga.getAuthInstance().then((googleAuth) => {
                if (!googleAuth) {
                    console.log('google Auth undefiend');
                    rej('google Auth undefiend');
                }

                const googleUser = googleAuth.currentUser.get();
                // refresh the token
                if (googleUser.isSignedIn()) {
                    logger.debug('refreshing the google access token');
                    googleUser.reloadAuthResponse()
                        .then((authResponse) => {
                            const { id_token, expires_at } = authResponse;
                            const profile = googleUser.getBasicProfile();
                            const user = {
                                email: profile.getEmail(),
                                name: profile.getName()
                            };

                            res({ token: id_token, expires_at });
                        });
                } else {
                    rej('User is not signed in with Google');
                }
            }).catch(err => {
                logger.debug('Failed to refresh google token', err);
                rej('Failed to refresh google token');
            });
        });
    }
}
