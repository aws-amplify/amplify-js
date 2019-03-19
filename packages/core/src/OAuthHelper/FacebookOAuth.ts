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

const logger = new Logger('CognitoCredentials');

const waitForInit = new Promise((res, rej) => {
    if (!JS.browserOrNode().isBrowser) {
        logger.debug('not in the browser, directly resolved');
        return res();
    }
    const fb = window['FB'];
    if (fb) {
        logger.debug('FB SDK already loaded');
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

export default class FacebookOAuth {
    public initialized = false;

    constructor() {
        this.refreshFacebookToken = this.refreshFacebookToken.bind(this);
        this._refreshFacebookTokenImpl = this._refreshFacebookTokenImpl.bind(this);
    }

    public async refreshFacebookToken() {
        if (!this.initialized) {
            logger.debug('need to wait for the Facebook SDK loaded');
            await waitForInit;
            this.initialized = true;
            logger.debug('finish waiting');
        }

        return this._refreshFacebookTokenImpl();
    }

    private _refreshFacebookTokenImpl() {
        let fb = null;
        if (JS.browserOrNode().isBrowser) fb = window['FB'];
        if (!fb) {
            logger.debug('no fb sdk available');
            return Promise.reject('no fb sdk available');
        }

        return new Promise((res, rej) => {
            fb.getLoginStatus(
                fbResponse => {
                    if (!fbResponse || !fbResponse.authResponse) {
                        logger.debug('no response from facebook when refreshing the jwt token');
                        rej('no response from facebook when refreshing the jwt token');
                    }

                    const response = fbResponse.authResponse;
                    const { accessToken, expiresIn } = response;
                    const date = new Date();
                    const expires_at = expiresIn * 1000 + date.getTime();
                    if (!accessToken) {
                        logger.debug('the jwtToken is undefined');
                        rej('the jwtToken is undefined');
                    }
                    res({token: accessToken, expires_at });
                }, 
                {scope: 'public_profile,email' }
            );
        });
    }
}
