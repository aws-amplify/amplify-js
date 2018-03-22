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
} from '../../Common';

const logger = new Logger('CognitoCredentials');

export default class FacebookOAuth {
    public refreshFacebookToken() {
        const fb = window['FB'];
        if (!fb) {
            logger.debug('no fb sdk available');
            return Promise.reject('no fb sdk available');
        }

        return new Promise((res, rej) => {
            fb.login(
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
