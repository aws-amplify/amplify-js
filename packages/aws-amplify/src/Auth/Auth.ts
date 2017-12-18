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
    Hub.dispatch('auth', {
        event: event,
        data: data
    }, 'Auth');
}

/**
* Provide authentication steps
*/
export default class AuthClass {
    private _config: AuthOptions;
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
            this.pickupCredentials();
        }

        return this._config;
    }

    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String} username - The username to be signed up
     * @param {String} password - The password of the user
     * @param {Object} attributeList - Other attributes
     * @return - A promise resolves callback data if success
     */
    public signUp(username: string,
                  password: string, 
                  email?: string|Array<Object>, 
                  phone_number?: string): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!password) { return Promise.reject('Password cannot be empty'); }

        let attributes = [];
        if(typeof(email) === 'string'){
            if (email) { attributes.push({Name: 'email', Value: email}); }
            if (phone_number) { attributes.push({Name: 'phone_number', Value: phone_number}); }
        }
        else {
            attributes = email;
        }
        return new Promise((resolve, reject) => {
            this.userPool.signUp(username, password, attributes, null, function(err, data) {
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
                        userAttributes: userAttributes,
                        requiredAttributes: requiredAttributes
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
                    verified: verified,
                    unverified: unverified
                }
            });
    }

    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    public currentUserPoolUser(): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }

        const user = this.userPool.getCurrentUser();
        if (!user) { return Promise.reject('No current user in userPool'); }

        logger.debug(user);
        return new Promise((resolve, reject) => {
            user.getSession(function(err, session) {
                if (err) { reject(err); } else { resolve(user); }
            });
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
        if (!this.userPool) { return Promise.reject('No userPool'); }

        const user = this.userPool.getCurrentUser();
        if (!user) { return Promise.reject('No current user'); }
        return this.userSession(user);
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
        return this.currentSession()
            .then(session => this.setCredentialsFromSession(session));
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
                onSuccess: function(data) { resolve(data); },
                onFailure: function(err) { reject(err); }
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
                onSuccess: function(data) { resolve(data); },
                onFailure: function(err) { reject(err); }
            });
        });
    }

    verifyCurrentUserAttribute(attr) {
        const that = this;
        return that.currentUserPoolUser()
            .then(user => that.verifyUserAttribute(user, attr));
    };

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
    };
    /**
     * Sign out method
     * @return - A promise resolved if success
     */
    public signOut(): Promise<any> {
        const source = this.credentials_source;

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

            const attributes = await this.userAttributes(user)
                .catch(err => {
                    logger.debug('currentUserInfo error', err);
                    return {};
                });

            const info = {
                username: user.username,
                id: credentials.identityId,
                email: attributes.email,
                phone_number: attributes.phone_number
            }
            return info;
        }

        if (source === 'federated') {
            const user = this.user;
            return user? user : {};
        }
    }

    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    essentialCredentials(credentials) {
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        }
    }

    /**
     * @return - A new guest CognitoIdentityCredentials
     */
    private noSessionCredentials() {
        const { identityPoolId, region } = this._config;
        const credentials = new CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId
        }, {
            region: region
        });

        credentials.params['IdentityId'] = null; // Cognito load IdentityId from local cache

        return credentials;
    }

    /**
     * Produce a credentials based on the session
     * @param {Object} session - The session used to generate the credentials
     * @return - A new CognitoIdentityCredentials
     */
    private sessionToCredentials(session) {
        const idToken = session.getIdToken().getJwtToken();
        const { region, userPoolId, identityPoolId } = this._config;
        const key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        let logins = {};
        logins[key] = idToken;
        return new CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
            Logins: logins
        }, {
            region: region
        });
    }

    private attributesToObject(attributes) {
        const obj = {};
        attributes.map(attribute => {
            obj[attribute.Name] = (attribute.Value === 'false')? false : attribute.Value;
        });
        return obj;
    }

    public federatedSignIn(provider, token, user) {
        const domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com'
        };

        const domain = domains[provider];
        if (!domain) {
            return Promise.reject(provider + ' is not supported: [google, facebook]');
        }

        const logins = {};
        logins[domain] = token;

        const { identityPoolId, region } = this._config;
        this.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
            Logins: logins
        }, {
            region: region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'federated';

        this.user = Object.assign(
            { id: this.credentials.identityId },
            user
        );
        dispatchAuthEvent('signIn', this.user);

        if (AWS && AWS.config) { AWS.config.credentials = this.credentials; }
        logger.debug('federated sign in credentials', this.credentials);
        return this.keepAlive();
    }

    private pickupCredentials() {
        if (this.credentials) {
            return this.keepAlive();
        } else if (this.setCredentialsFromAWS()) {
            return this.keepAlive();
        } else {
            logger.debug('pickup from userPool');
            return this.currentUserCredentials()
                .then(() => this.keepAlive())
                .catch(err => {
                    logger.debug('error when pickup', err)
                    return null;
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
        const credentials = new CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId
        }, {
            region: region
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
        let logins = {};
        logins[key] = idToken;
        this.credentials = new CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
            Logins: logins
        }, {
            region: region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'userPool';
    }

    private keepAlive() {
        if (!this.credentials) { this.setCredentialsForGuest() }

        const ts = new Date().getTime();
        const delta = 10 * 60 * 1000; // 10 minutes
        const credentials = this.credentials;
        const { expired, expireTime } = credentials;
        if (!expired && expireTime > ts + delta) {
            return Promise.resolve(credentials);
        }

        return new Promise((resolve, reject) => {
            credentials.refresh(err => {
                if (err) {
                    logger.debug('refresh credentials error', err);
                    resolve(null);
                } else {
                    resolve(credentials);
                }
            });
        });
    }
}
