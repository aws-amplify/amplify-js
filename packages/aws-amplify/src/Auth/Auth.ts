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

import { AuthOptions } from './types';

import {
    AWS,
    Cognito,
    ConsoleLogger as Logger,
    Constants,
    Hub
} from '../Common';
import Platform from '../Common/Platform';
import Cache from '../Cache';

const logger = new Logger('AuthClass');

const {
    CognitoIdentityCredentials
} = AWS;

const {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} = Cognito;

const dispatchAuthEvent = (event, data) => {
    Hub.dispatch('auth', { event, data }, 'Auth');
};

/**
* Provide authentication steps
*/
export default class AuthClass {
    private _config: AuthOptions;
    private _userPoolStorageSync: Promise<any>;
    private userPool = null;

    private credentials = null;
    private credentials_source = ''; // aws, guest, userPool, federated
    private user:any = null;

    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    constructor(config: AuthOptions) {
        this.configure(config);
        if (AWS.config) {
            AWS.config.update({customUserAgent: Constants.userAgent});
        } else {
            logger.warn('No AWS.config');
        }
    }

    configure(config) {
        logger.debug('configure Auth');
        let conf = config? config.Auth || config : {};
        if (conf['aws_cognito_identity_pool_id']) {
            conf = {
                userPoolId: conf['aws_user_pools_id'],
                userPoolWebClientId: conf['aws_user_pools_web_client_id'],
                region: conf['aws_cognito_region'],
                identityPoolId: conf['aws_cognito_identity_pool_id']
            };
        }
        this._config = Object.assign({}, this._config, conf);
        if (!this._config.identityPoolId) { logger.debug('Do not have identityPoolId yet.'); }
        const { userPoolId, userPoolWebClientId } = this._config;
        if (userPoolId) {
            this.userPool = new CognitoUserPool({
                UserPoolId: userPoolId,
                ClientId: userPoolWebClientId
            });
            if (Platform.isReactNative) {
                const that = this;
                this._userPoolStorageSync = new Promise((resolve, reject) => {
                    this.userPool.storage.sync((err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            } else {
                this.pickupCredentials();
            }
        }
        return this._config;
    }

    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String | object} params - The user attirbutes used for signin
     * @param {String[]} restOfAttrs - for the backward compatability 
     * @return - A promise resolves callback data if success
     */
    public signUp(params: string | object, ...restOfAttrs: string[]): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }

        let username : string = null;
        let password : string = null;
        const attributes : object[] = [];
        let validationData: object[] = null;
        if (params && typeof params === 'string') {
            username = params;
            password = restOfAttrs? restOfAttrs[0] : null;
            const email : string = restOfAttrs? restOfAttrs[1] : null;
            const phone_number : string = restOfAttrs? restOfAttrs[2] : null;
            if (email) attributes.push({Name: 'email', Value: email});
            if (phone_number) attributes.push({Name: 'phone_number', Value: phone_number}); 
        } else if (params && typeof params === 'object') {
            username = params['username'];
            password = params['password'];
            const attrs = params['attributes'];
            if (attrs) {
                Object.keys(attrs).map(key => {
                    const ele : object = { Name: key, Value: attrs[key] };
                    attributes.push(ele);
                });
            }
            validationData = params['validationData'] || null;
        } else {
            return Promise.reject('The first parameter should either be non-null string or object');
        }

        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!password) { return Promise.reject('Password cannot be empty'); }     
        
        logger.debug('signUp attrs:', attributes);
        logger.debug('signUp validation data:', validationData);
        
        return new Promise((resolve, reject) => {
            this.userPool.signUp(username, password, attributes, validationData, function(err, data) {
                if (err) {
                    dispatchAuthEvent('signUp_failure', err);
                    reject(err);
                } else {
                    dispatchAuthEvent('signUp', data);
                    resolve(data);
                }
            });
        });
    }

    /**
     * Send the verfication code to confirm sign up
     * @param {String} username - The username to be confirmed
     * @param {String} code - The verification code
     * @return - A promise resolves callback data if success
     */
    public confirmSignUp(username: string, code: string): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!code) { return Promise.reject('Code cannot be empty'); }

        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise((resolve, reject) => {
            user.confirmRegistration(code, true, function(err, data) {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }
    
    /**
     * Resend the verification code
     * @param {String} username - The username to be confirmed
     * @return - A promise resolves data if success
     */
    public resendSignUp(username: string): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }

        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise((resolve, reject) => {
            user.resendConfirmationCode(function(err, data) {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    /**
     * Sign in
     * @param {String} username - The username to be signed in 
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    public signIn(username: string, password: string): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!password) { return Promise.reject('Password cannot be empty'); }

        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });
        const that = this;
        return new Promise((resolve, reject) => {
            user.authenticateUser(authDetails, {
                onSuccess: (session) => {
                    logger.debug(session);
                    that.setCredentialsFromSession(session);
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                },
                onFailure: (err) => {
                    logger.debug('signIn failure', err);
                    dispatchAuthEvent('signIn_failure', err);
                    reject(err);
                },
                mfaRequired: (challengeName, challengeParam) => {
                    logger.debug('signIn MFA required');
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    logger.debug('signIn new password');
                    user['challengeName'] = 'NEW_PASSWORD_REQUIRED';
                    user['challengeParam'] = {
                        userAttributes,
                        requiredAttributes
                    };
                    resolve(user);
                }
            });
        });
    }

    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    public confirmSignIn(user: any, code: string): Promise<any> {
        if (!code) { return Promise.reject('Code cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.sendMFACode(code, {
                onSuccess: (session) => {
                    logger.debug(session);
                    that.setCredentialsFromSession(session);
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                },
                onFailure: (err) => {
                    logger.debug('confirm signIn failure', err);
                    reject(err);
                }
            });
        });
    }

    public completeNewPassword(
        user: any,
        password: string,
        requiredAttributes: any
    ): Promise<any> {
        if (!password) { return Promise.reject('Password cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.completeNewPasswordChallenge(password, requiredAttributes, {
                onSuccess: (session) => {
                    logger.debug(session);
                    that.setCredentialsFromSession(session);
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                },
                onFailure: (err) => {
                    logger.debug('completeNewPassword failure', err);
                    reject(err);
                },
                mfaRequired: (challengeName, challengeParam) => {
                    logger.debug('signIn MFA required');
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                }
            });
        });
    }

    /**
     * Update an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise} 
     **/
    public updateUserAttributes(user, attributes:object): Promise<any> {
        let attr:object = {};
        const attributeList:Array<object> = [];
        return this.userSession(user)
            .then(session => {
                return new Promise((resolve, reject) => {
                    for (const key in attributes) {
                        if ( key !== 'sub' &&
                            key.indexOf('_verified') < 0 && 
                            attributes[key] ) {
                            attr = {
                                'Name': key,
                                'Value': attributes[key]
                            };
                            attributeList.push(attr);
                        }
                    }
                    user.updateAttributes(attributeList, (err,result) => {
                        if (err) { reject(err); } else { resolve(result); }
                    });
                });
            }); 
    }
    /**
     * Return user attributes
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to user attributes if success
     */
    public userAttributes(user): Promise<any> {
        return this.userSession(user)
            .then(session => {
                return new Promise((resolve, reject) => {
                    user.getUserAttributes((err, attributes) => {
                        if (err) { reject(err); } else { resolve(attributes); }
                    });
                });
            });
    }

    public verifiedContact(user) {
        const that = this;
        return this.userAttributes(user)
            .then(attributes => {
                const attrs = that.attributesToObject(attributes);
                const unverified = {};
                const verified = {};
                if (attrs['email']) {
                    if (attrs['email_verified']) {
                        verified['email'] = attrs['email'];
                    } else {
                        unverified['email'] = attrs['email'];
                    }
                }
                if (attrs['phone_number']) {
                    if (attrs['phone_number_verified']) {
                        verified['phone_number'] = attrs['phone_number'];
                    } else {
                        unverified['phone_number'] = attrs['phone_number'];
                    }
                }
                return {
                    verified,
                    unverified
                };
            });
    }

    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    public currentUserPoolUser(): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        let user = null;
        if (Platform.isReactNative) {
            const that = this;
            return this.getSyncedUser().then(user => {
                return new Promise((resolve, reject) => {
                    user.getSession(function(err, session) {
                        if (err) { reject(err); } else { resolve(user); }
                    });
                });
            });
        } else {
            user = this.userPool.getCurrentUser();
            if (!user) { return Promise.reject('No current user in userPool'); }
            return new Promise((resolve, reject) => {
                user.getSession(function(err, session) {
                    if (err) { reject(err); } else { resolve(user); }
                });
            });
        }
    }

    /**
     * Return the current user after synchornizing AsyncStorage
     * @return - A promise with the current authenticated user
     **/
    private getSyncedUser(): Promise<any> {
        const that = this;
        return (this._userPoolStorageSync || Promise.resolve()).then(result => {
            if (!that.userPool) {
                return Promise.reject('No userPool');
            }
            that.credentials_source = 'userPool';
            return that.userPool.getCurrentUser();
        });
    }

    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    public currentAuthenticatedUser(): Promise<any> {
        const source = this.credentials_source;
        logger.debug('get current authenticated user. source ' + source);
        if (!source || source === 'aws' || source === 'userPool') {
            return this.currentUserPoolUser();
        }
        if (source === 'federated') {
            return Promise.resolve(this.user);
        }
        return Promise.reject('not authenticated');
    }

    /**
     * Get current user's session
     * @return - A promise resolves to session object if success 
     */
    public currentSession() : Promise<any> {
        let user:any;
        const that = this;
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (Platform.isReactNative) {
            return this.getSyncedUser().then(user => {
                if (!user) { return Promise.reject('No current user'); }
                return that.userSession(user);
            });
        } else {
            user = this.userPool.getCurrentUser();
            if (!user) { return Promise.reject('No current user'); }
            return this.userSession(user);
        }
    }

    /**
     * Get the corresponding user session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    public userSession(user) : Promise<any> {
        return new Promise((resolve, reject) => {
            logger.debug(user);
            user.getSession(function(err, session) {
                if (err) { reject(err); } else { resolve(session); }
            });
        });
    }

    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    public currentUserCredentials() : Promise<any> {
        if (Platform.isReactNative) {
            // asyncstorage
            const that = this;
            return Cache.getItem('federatedInfo')
                .then((federatedInfo) => {
                    if (federatedInfo) {
                        const { provider, token, user} = federatedInfo;
                        return new Promise((resolve, reject) => {
                            that.setCredentialsFromFederation(provider, token, user);
                            resolve();
                        });
                    } else {
                        return that.currentSession()
                            .then(session => that.setCredentialsFromSession(session))
                            .catch((error) => that.setCredentialsForGuest());
                    }
            }).catch((error) => {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            });
        } else {
            // first to check whether there is federation info in the local storage
            const federatedInfo = Cache.getItem('federatedInfo');
            if (federatedInfo) {
                const { provider, token, user} = federatedInfo;
                return new Promise((resolve, reject) => {
                    this.setCredentialsFromFederation(provider, token, user);
                    resolve();
                });
            } else {
                return this.currentSession()
                    .then(session => this.setCredentialsFromSession(session))
                    .catch((error) => this.setCredentialsForGuest());
            }
        }
    }

    public currentCredentials(): Promise<any> {
        return this.pickupCredentials();
    }

    /**
     * Initiate an attribute confirmation request
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attributes to be verified
     * @return - A promise resolves to callback data if success
     */
    public verifyUserAttribute(user, attr): Promise<any> {
        return new Promise((resolve, reject) => {
            user.getAttributeVerificationCode(attr, {
                onSuccess(data) { resolve(data); },
                onFailure(err) { reject(err); }
            });
        });
    }

    /**
     * Confirm an attribute using a confirmation code
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    public verifyUserAttributeSubmit(user, attr, code): Promise<any> {
        if (!code) { return Promise.reject('Code cannot be empty'); }

        return new Promise((resolve, reject) => {
            user.verifyAttribute(attr, code, {
                onSuccess(data) { resolve(data); },
                onFailure(err) { reject(err); }
            });
        });
    }

    verifyCurrentUserAttribute(attr) {
        const that = this;
        return that.currentUserPoolUser()
            .then(user => that.verifyUserAttribute(user, attr));
    }

    /**
     * Confirm current user's attribute using a confirmation code
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    verifyCurrentUserAttributeSubmit(attr, code) {
        const that = this;
        return that.currentUserPoolUser()
            .then(user => that.verifyUserAttributeSubmit(user, attr, code));
    }
    /**
     * Sign out method
     * @return - A promise resolved if success
     */
    public async signOut(): Promise<any> {
        await this.currentUserCredentials();

        const source = this.credentials_source;

        // clean out the cached stuff
        this.credentials.clearCachedId();
        // clear federatedInfo
        Cache.removeItem('federatedInfo');

        if (source === 'aws' || source === 'userPool') {
            if (!this.userPool) { return Promise.reject('No userPool'); }

            const user = this.userPool.getCurrentUser();
            if (!user) { return Promise.resolve(); }

            user.signOut();
        }

        return new Promise((resolve, reject) => {
            this.setCredentialsForGuest();
            dispatchAuthEvent('signOut', this.user);
            this.user = null;
            resolve();
        });
    }

    /**
     * Initiate a forgot password request
     * @param {String} username - the username to change password
     * @return - A promise resolves if success 
     */
    public forgotPassword(username: string): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }

        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise((resolve, reject) => {
            user.forgotPassword({
                onSuccess: () => { resolve(); },
                onFailure: err => {
                    logger.debug('forgot password failure', err);
                    reject(err);
                },
                inputVerificationCode: data => {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Confirm a new password using a confirmation Code
     * @param {String} username - The username 
     * @param {String} code - The confirmation code
     * @param {String} password - The new password
     * @return - A promise that resolves if success
     */
    public forgotPasswordSubmit(
        username: string,
        code: string,
        password: string
    ): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!code) { return Promise.reject('Code cannot be empty'); }
        if (!password) { return Promise.reject('Password cannot be empty'); }

        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise((resolve, reject) => {
            user.confirmPassword(code, password, {
                onSuccess: () => { resolve(); },
                onFailure: err => { reject(err); }
            });
        });
    }

    /**
     * Get user information
     * @async
     * @return {Object }- current User's information
     */
    public async currentUserInfo() {
        const credentials = this.credentials;
        const source = this.credentials_source;
        if (!source) { return null; }

        if (source === 'aws' || source === 'userPool') {
            const user = await this.currentUserPoolUser()
                .catch(err => logger.debug(err));
            if (!user) { return null; }

            try {
                const attributes = await this.userAttributes(user);
                const userAttrs:object = this.attributesToObject(attributes);
            
                const info = {
                    'id': credentials.identityId,
                    'username': user.username,
                    'attributes': userAttrs
                };
                return info;
            } catch(err) {
                console.warn(err);
                logger.debug('currentUserInfo error', err);
                return {};
            }
        }

        if (source === 'federated') {
            const user = this.user;
            return user? user : {};
        }
    }

    /**
     * For federated login
     * @param {String} provider - federation login provider
     * @param {Object} response - response including access_token
     * @param {String} user - user info 
     */
    public federatedSignIn(provider, response, user) {
        const { token, expires_at } = response;
        this.setCredentialsFromFederation(provider, token, user);

        // store it into localstorage
        Cache.setItem('federatedInfo', { provider, token, user }, { priority: 1 });
        // dispatchAuthEvent('signIn', this.user);
        logger.debug('federated sign in credentials', this.credentials);
        return this.keepAlive();
    }

    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    public essentialCredentials(credentials) {
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        };
    }

    private attributesToObject(attributes) {
        const obj = {};
        if (attributes) {
            attributes.map(attribute => {
                if (attribute.Name === 'sub') return;

                if (attribute.Value === 'true') {
                    obj[attribute.Name] = true;
                } else if (attribute.Value === 'false') {
                    obj[attribute.Name] = false;
                } else {
                    obj[attribute.Name] = attribute.Value;
                }
            });
        }
        return obj;
    }

    private setCredentialsFromFederation(provider, token, user) {
        const domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com',
            'amazon': 'www.amazon.com'
        };

        const domain = domains[provider];
        if (!domain) {
            return Promise.reject(provider + ' is not supported: [google, facebook, amazon]');
        }

        const logins = {};
        logins[domain] = token;

        const { identityPoolId, region } = this._config;
        this.credentials = new AWS.CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId,
            Logins: logins
        },  {
            region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'federated';

        this.user = Object.assign(
            { id: this.credentials.identityId },
            user
        );
        
        if (AWS && AWS.config) { AWS.config.credentials = this.credentials; }
    }

    private pickupCredentials() {
        if (this.credentials) {
            return this.keepAlive();
        } else if (this.setCredentialsFromAWS()) {
            return this.keepAlive();
        } else {
            return this.currentUserCredentials()
                .then(() => this.keepAlive())
                .catch(err => {
                    logger.debug('error when pickup', err);
                    this.setCredentialsForGuest();
                    return this.keepAlive();
                });
        }
    }

    private setCredentialsFromAWS() {
        if (AWS.config && AWS.config.credentials) {
            this.credentials = AWS.config.credentials;
            this.credentials_source = 'aws';
            return true;
        }
        return false;
    }

    private setCredentialsForGuest() {
        const { identityPoolId, region } = this._config;
        const credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId
        },  {
            region
        });
        credentials.params['IdentityId'] = null; // Cognito load IdentityId from local cache
        this.credentials = credentials;
        this.credentials.authenticated = false;
        this.credentials_source = 'guest';
    }
    
    private setCredentialsFromSession(session) {
        logger.debug('set credentials from session');
        const idToken = session.getIdToken().getJwtToken();
        const { region, userPoolId, identityPoolId } = this._config;
        const key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        const logins = {};
        logins[key] = idToken;
        this.credentials = new CognitoIdentityCredentials(
            {
            IdentityPoolId: identityPoolId,
            Logins: logins
        },  {
            region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'userPool';
    }

    private keepAlive() {
        if (!this.credentials) { this.setCredentialsForGuest(); }

        const ts = new Date().getTime();
        const delta = 10 * 60 * 1000; // 10 minutes
        let credentials = this.credentials;
        const { expired, expireTime } = credentials;
        if (!expired && expireTime > ts + delta) {
            return Promise.resolve(credentials);
        }

        const that = this;
        return new Promise((resolve, reject) => {
            that.currentUserCredentials()
                .then(() => {
                    credentials = that.credentials;
                    credentials.refresh(err => {
                        logger.debug('changed from previous');
                        if (err) {
                            logger.debug('refresh credentials error', err);
                            resolve(null);
                        } else {
                            resolve(credentials);
                        }
                    });
                })
                .catch(() => resolve(null));
        });
    }
}
