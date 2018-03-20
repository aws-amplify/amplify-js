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

export default class GoogleOAuth {
    public refreshGoogleToken() {
        const ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;
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
                }
            }).catch(err => {
                logger.debug('Failed to refresh google token', err);
                rej('Failed to refresh google token');
            });
        });
    }
}
