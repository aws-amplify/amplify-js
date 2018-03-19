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
    AWS,
    Cognito,
    ConsoleLogger as Logger,
    Constants,
    Hub
} from '../../Common';

import { CredentialsProvider } from '../types';
import Platform from '../../Common/Platform';
import Cache from '../../Cache';
import { ICognitoUserPoolData, ICognitoUserData } from 'amazon-cognito-identity-js';
const {
    CognitoIdentityCredentials
} = AWS;

const {
    CognitoUserPool,
    CognitoUser,
    CookieStorage
} = Cognito;

const logger = new Logger('CognitoCredentials');

export default class CognitoCredentials implements CredentialsProvider {
    private _credentials;
    private _credentials_source = ''; // aws, guest, userPool, federated
    private _config;
    private _userPool = null;
    private _userPoolStorageSync;
    private _gettingCredPromise;

    constructor(config?) {
        this._config = config? config: {};
        this._credentials = null;
        this._gettingCredPromise = null;
    }

    /**
     * pass the configuration
     * @param config 
     */
    public configure(config) {
        logger.debug('configure CognitoCredentials with config', config);
        const conf= config? config: {};
        this._config = Object.assign({}, this._config, conf);

        const { cognitoUserPoolId, cognitoUserPoolWebClientId, cookieStorage } = this._config;
        if (cognitoUserPoolId) {
            const userPoolData: ICognitoUserPoolData = {
                UserPoolId: cognitoUserPoolId,
                ClientId: cognitoUserPoolWebClientId,
            };
            if (cookieStorage) {
                userPoolData.Storage = new CookieStorage(cookieStorage);
            }
            this._userPool = new CognitoUserPool(userPoolData);
            if (Platform.isReactNative) {
                const that = this;
                this._userPoolStorageSync = new Promise((resolve, reject) => {
                    this._userPool.storage.sync((err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            }
        }
        
        return this._config;
    }

    /**
     * Get the category of this provider
     */
    public getCategory() {
        return 'Credentials';
    }

    /**
     * Get the name of this provider
     */
    public getProviderName() {
        return 'AWSCognito';
    }

    /**
     * Set the credentials with configuration
     * @param config - the configuration to set the credentials
     */
    public setCredentials(config) {
        const { session, guest, federated } = config;
        
        if (session) {
            return this._setCredentialsFromSession(session);
        } else if (guest) {
            return this._setCredentialsForGuest();
        } else if (federated) {
            return this._setCredentialsFromFederation(federated);
        } else {
            logger.debug('incorrect configuration for credentials', config);
            return Promise.reject('incorrect configuration for credentials');
        }
    }

    /**
     * Remove the credential from library
     */
    public removeCredentials() {
        if (this._credentials) this._credentials.clearCachedId();
        Cache.removeItem('federatedInfo');
        this._credentials = null;
        this._credentials_source = '';
    }

    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    public getCredentials(config?): Promise<any> {
        logger.debug('getting credentials with config', config);
        const cred = this._credentials || AWS.config.credentials;
        if (cred && !this._isExpired(cred)) {
            logger.debug('credentails exists and not expired');
            return Promise.resolve(cred);
        } else {
            if (!this._gettingCredPromise) {
                this._gettingCredPromise = this._retrieveCredentialsFromAuth();
            }
            return this._gettingCredPromise;  
        } 
    }

    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    public essentialCredentials(params) {
        logger.debug('essential credentials');
        const { credentials } = params;
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        };
    }

    private async _retrieveCredentialsFromAuth() : Promise<any> {
        try {
            logger.debug('getting credentials from cognito auth');
            const federatedInfo = await Cache.getItem('federatedInfo');
            if (federatedInfo) {
                const { provider, token, user} = federatedInfo;
                return this._setCredentialsFromFederation({ provider, token, user });
            } else {
                const that = this;
                return this.currentSession()
                    .then(session => that._setCredentialsFromSession(session))
                    .catch((error) => that._setCredentialsForGuest());
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private _isExpired(credentials): boolean {
        if (!credentials) {
            logger.debug('no credentials for expiration check');
            return true;
        }
        logger.debug('is this credentials expired?', credentials);
        const ts = new Date().getTime();
        const delta = 10 * 60 * 1000; // 10 minutes
        const { expired, expireTime } = credentials;
        if (!expired && expireTime > ts + delta) {
            return false;
        }
        return true;
    }

    private _refreshCredentials(credentials): Promise<any> {
        logger.debug('try to refresh credentials', credentials);
        const cred = credentials || this._credentials;
        if (!cred) {
            return Promise.reject(new Error('no credentials provided for refreshing!'));
        }
        return new Promise((resolve,reject) => {
            cred.refresh(err => {
                if (err) {
                    logger.debug('refresh credentials error', err);
                    resolve(null);
                } else {
                    resolve(cred);
                }
            });
        });
    }

    private _setCredentialsForGuest() {
        logger.debug('set credentials from guest with config', this._config);
        const { cognitoIdentityPoolId, cognitoRegion, mandatorySignIn } = this._config;
        if (mandatorySignIn) {
            logger.debug('mandatory sign in, no guest credentials provided');
            this._credentials = null;
            this._credentials_source = 'no credentials';
            return;
        }

        const credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: cognitoIdentityPoolId
        },  {
            region: cognitoRegion
        });

        const that = this;
        return new Promise((res, rej) => {
            credentials.getPromise().then(
                () => {
                    logger.debug('Load creadentials for guest successfully', credentials);
                    that._credentials = credentials;
                    that._credentials.authenticated = false;
                    that._credentials_source = 'guest';
                    if (AWS && AWS.config) { AWS.config.credentials = that._credentials; }
                    that._gettingCredPromise = null;
                    res(that._credentials);
                },
                (err) => {
                    logger.debug('Failed to load creadentials for guest', credentials);
                    that._gettingCredPromise = null;
                    rej('Failed to load creadentials for guest');
                }
            );
        });
    }
    
    private _setCredentialsFromSession(session) {
        logger.debug('set credentials from session');
        const idToken = session.getIdToken().getJwtToken();
        const { cognitoRegion, cognitoUserPoolId, cognitoIdentityPoolId } = this._config;
        const key = 'cognito-idp.' + cognitoRegion + '.amazonaws.com/' + cognitoUserPoolId;
        const logins = {};
        logins[key] = idToken;
        const credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: cognitoIdentityPoolId,
            Logins: logins
        },  {
            region: cognitoRegion
        });
        
        const that = this;
        return new Promise((res, rej) => {
            credentials.getPromise().then(
                () => {
                    logger.debug('Load creadentials for userpool user successfully', credentials);
                    that._credentials = credentials;
                    that._credentials.authenticated = true;
                    that._credentials_source = 'userpool';
                    if (AWS && AWS.config) { AWS.config.credentials = that._credentials; }
                    that._gettingCredPromise = null;
                    res(that._credentials);
                },
                (err) => {
                    logger.debug('Failed to load creadentials for userpoool user', credentials);
                    that._gettingCredPromise = null;
                    rej('Failed to load creadentials for userpool user');
                }
            );
        });
    }

    private _setCredentialsFromFederation(federated) {
        logger.debug('set credentials from federation');
        const { provider, token, user } = federated;
        const domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com',
            'amazon': 'www.amazon.com',
            'developer': 'cognito-identity.amazonaws.com'
        };

        Cache.setItem('federatedInfo', { provider, token, user }, { priority: 1 });

        const domain = domains[provider];
        if (!domain) {
            return Promise.reject(provider + ' is not supported: [google, facebook, amazon]');
        }

        const logins = {};
        logins[domain] = token;

        const { cognitoIdentityPoolId, cognitoRegion } = this._config;
        const credentials = new AWS.CognitoIdentityCredentials(
            {
            IdentityPoolId: cognitoIdentityPoolId,
            Logins: logins
        },  {
            region: cognitoRegion
        });
        
        const that = this;
        return new Promise((res, rej) => {
            credentials.getPromise().then(
                () => {
                    logger.debug('Load creadentials for federation user successfully', credentials);
                    that._credentials = credentials;
                    that._credentials.authenticated = true;
                    that._credentials_source = 'federated';
                    if (AWS && AWS.config) { AWS.config.credentials = that._credentials; }
                    that._gettingCredPromise = null;
                    res(that._credentials);
                },
                (err) => {
                    logger.debug('Failed to load creadentials for federation user', credentials);
                    that._gettingCredPromise = null;
                    rej('Failed to load creadentials for federation user');
                }
            );
        });
    }

    public currentSession(config) : Promise<any> {
        let user:any;
        const that = this;
        if (!this._userPool) { return Promise.reject('No userPool'); }
        if (Platform.isReactNative) {
            return this._getSyncedUser().then(user => {
                if (!user) { return Promise.reject('No current user'); }
                return that._userSession(user);
            });
        } else {
            user = this._userPool.getCurrentUser();
            if (!user) { return Promise.reject('No current user'); }
            return this._userSession(user);
        }
    }

    /**
     * Return the current user after synchornizing AsyncStorage
     * @return - A promise with the current authenticated user
     **/
    private _getSyncedUser(): Promise<any> {
        const that = this;
        return (this._userPoolStorageSync || Promise.resolve()).then(result => {
            if (!that._userPool) {
                return Promise.reject('No userPool');
            }
            return that._userPool.getCurrentUser();
        });
    }

    private _userSession(user) : Promise<any> {
        return new Promise((resolve, reject) => {
            logger.debug(user);
            user.getSession(function(err, session) {
                if (err) { reject(err); } else { resolve(session); }
            });
        });
    }
}
