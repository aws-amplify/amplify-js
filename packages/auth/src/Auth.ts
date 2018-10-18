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
    AuthOptions, 
    FederatedResponse, 
    SignUpParams, 
    FederatedUser, 
    ConfirmSignUpOptions, 
    SignOutOpts,
    ExternalSession,
    AuthProvider,
    SetSessionResult
} from './types';

import {
    AWS,
    ConsoleLogger as Logger,
    Constants,
    Hub,
    JS,
    Parser,
    Credentials,
    StorageHelper,
    ICredentials   
} from '@aws-amplify/core';
import Cache from '@aws-amplify/cache';
import { 
    CookieStorage,
    CognitoUserPool,
    AuthenticationDetails,
    ICognitoUserPoolData, 
    ICognitoUserData, 
    ISignUpResult, 
    CognitoUser, 
    MFAOption,
    CognitoUserSession,
    IAuthenticationCallback,
    ICognitoUserAttributeData,
    CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import { CognitoAuth } from 'amazon-cognito-auth-js';
import { 
    AWSCognitoProvider, 
    GoogleProvider,
    FacebookProvider,
    AmazonProvider,
    DeveloperProvider,
    GenericProvider
} from './providers';

const logger = new Logger('AuthClass');
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
    private _cognitoAuthClient = null;
    private user:any = null;

    private _gettingCredPromise = null;
    private _storage;
    private _storageSync;
    private _keyPrefix;
    private _pluggables;

    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    constructor(config: AuthOptions) {
        this.currentUserCredentials = this.currentUserCredentials.bind(this);

        this._pluggables = [];
        // add default pluggables
        this.addPluggable(new AWSCognitoProvider());
        this.addPluggable(new GoogleProvider());
        this.addPluggable(new FacebookProvider());
        this.addPluggable(new AmazonProvider());
        this.addPluggable(new DeveloperProvider());
        this.addPluggable(new GenericProvider());


        if (AWS.config) {
            AWS.config.update({customUserAgent: Constants.userAgent});
        } else {
            logger.warn('No AWS.config');
        }
         this.configure(config);
    }

    public getModuleName() {
        return 'Auth';
    }

    configure(config) {
        if (!config) return this._config || {};
        logger.debug('configure Auth', config);
        const conf = Object.assign({}, this._config, Parser.parseMobilehubConfig(config).Auth, config);
        this._config = conf;
        const { 
            userPoolId, 
            userPoolWebClientId, 
            cookieStorage, 
            oauth, 
            region, 
            identityPoolId, 
            mandatorySignIn,
            refreshHandlers,
            storage,
            identityPoolRegion
        } = this._config;

        this._keyPrefix = `AmplifyAuth_${userPoolId}_${identityPoolId}`;

        if (!this._config.storage) {
            // backward compatbility
            if (cookieStorage) this._storage = new CookieStorage(cookieStorage);
            else {
                this._storage = new StorageHelper().getStorage();
            }
        } else {
            this._storage = this._config.storage;
        }

        this._storageSync = Promise.resolve();
        if (typeof this._storage['sync'] === 'function') {
            this._storageSync = this._storage['sync']();
        }

        if (userPoolId) {
            const userPoolData: ICognitoUserPoolData = {
                UserPoolId: userPoolId,
                ClientId: userPoolWebClientId,
            };
            userPoolData.Storage = this._storage;
            
            this.userPool = new CognitoUserPool(userPoolData);
        }

        Credentials.configure({
            mandatorySignIn,
            region: identityPoolRegion || region,
            userPoolId,
            identityPoolId,
            refreshHandlers,
            storage: this._storage,
            _keyPrefix: this._keyPrefix
        });

        // initiailize cognitoauth client if hosted ui options provided
        if (oauth) {
            const that = this;

            const cognitoAuthParams = Object.assign(
                {
                    ClientId: userPoolWebClientId,
                    UserPoolId: userPoolId,
                    AppWebDomain: oauth.domain,
                    TokenScopesArray: oauth.scope,
                    RedirectUriSignIn: oauth.redirectSignIn,
                    RedirectUriSignOut: oauth.redirectSignOut,
                    ResponseType: oauth.responseType,
                    Storage: this._storage
                },
                oauth.options
            );

            logger.debug('cognito auth params', cognitoAuthParams);
            this._cognitoAuthClient = new CognitoAuth(cognitoAuthParams);
            this._cognitoAuthClient.userhandler = {
                // user signed in
                onSuccess: (result) => {
                    that.user = that.userPool.getCurrentUser();
                    logger.debug("Cognito Hosted authentication result", result);
                    that.currentSession().then(async (session) => {
                        try {
                            await Credentials.clear();
                            const cred = await Credentials.set(session, 'session');
                            logger.debug('sign in succefully with', cred);
                        } catch (e) {
                            logger.debug('sign in without aws credentials', e);
                        } finally {
                            dispatchAuthEvent('signIn', that.user);
                            dispatchAuthEvent('cognitoHostedUI', that.user);
                        }
                    });
                },
                onFailure: (err) => {
                    logger.debug("Error in cognito hosted auth response", err);
                    dispatchAuthEvent('signIn_failure', err);
                }
            };
            // if not logged in, try to parse the url.
            this.currentAuthenticatedUser().then(() => {
                logger.debug('user already logged in');
            }).catch(e => {
                logger.debug('not logged in, try to parse the url');
                if (!JS.browserOrNode().isBrowser || !window.location) {
                    logger.debug('not in the browser');
                    return;
                }
                const curUrl = window.location.href;
                this._cognitoAuthClient.parseCognitoWebResponse(curUrl);
            });
        }

        this._pluggables.forEach(pluggable => {
            pluggable.configure({
                ...this._config,
                storage: this._storage,
                _keyPrefix: this._keyPrefix
            });
        });
        

        dispatchAuthEvent('configured', null);
        return this._config;
    }

    public async addPluggable(pluggable: AuthProvider) {
        if (pluggable && pluggable.getCategory() === 'Auth') {
            this._pluggables.push(pluggable);
            // const config = pluggable.configure(this._options);
            // return config;
        }
    }

    /*<---------------------------------- Registration Related Methods -------------------------------->*/
    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String | object} params - The user attirbutes used for signin
     * @param {String[]} restOfAttrs - for the backward compatability
     * @return - A promise resolves callback data if success
     */
    public signUp(params: string | SignUpParams, ...restOfAttrs: string[]): Promise<ISignUpResult> {
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
     * @param {ConfirmSignUpOptions} options - other options for confirm signup
     * @return - A promise resolves callback data if success
     */
    public confirmSignUp(username: string, code: string, options?: ConfirmSignUpOptions): Promise<any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!code) { return Promise.reject('Code cannot be empty'); }

        const user = this.createCognitoUser(username);
        const forceAliasCreation = options && typeof options.forceAliasCreation === 'boolean'
            ? options.forceAliasCreation : true;

        return new Promise((resolve, reject) => {
            user.confirmRegistration(code, forceAliasCreation, function(err, data) {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    /**
     * Resend the verification code
     * @param {String} username - The username to be confirmed
     * @return - A promise resolves data if success
     */
    public resendSignUp(username: string): Promise<string> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }

        const user = this.createCognitoUser(username);
        return new Promise((resolve, reject) => {
            user.resendConfirmationCode(function(err, data) {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    /*<---------------------------------- Sign In Related Methods --------------------------------->*/
    /**
     * Sign in
     * @param {String} username - The username to be signed in
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser
     */
    public signIn(username: string, password?: string): Promise<CognitoUser | any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }

        if (password) {
            return this.signInWithPassword(username, password);
        } else {
            return this.signInWithoutPassword(username);
        }
    }

    /**
     * Return an object with the authentication callbacks
     * @param {CognitoUser} user - the cognito user object
     * @param {} resolve - function called when resolving the current step
     * @param {} reject - function called when rejecting the current step
     * @return - an object with the callback methods for user authentication
     */
    private authCallbacks(
        user: CognitoUser, 
        resolve: (value?: CognitoUser | any) => void, reject: (value?: any) => void
    ): IAuthenticationCallback {
        const that = this;
        return {
            onSuccess: async (session) => {
                this._addSessionSource('AWSCognito');
                logger.debug(session);
                delete(user['challengeName']);
                delete(user['challengeParam']);
                try {
                    await Credentials.clear();
                    const cred = await Credentials.set(session, 'session');
                    logger.debug('succeed to get cognito credentials', cred);
                } catch (e) {
                    logger.debug('cannot get cognito credentials', e);
                } finally {
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                }
            },
            onFailure: (err) => {
                logger.debug('signIn failure', err);
                dispatchAuthEvent('signIn_failure', err);
                reject(err);
            },
            customChallenge: (challengeParam) => {
                logger.debug('signIn custom challenge answer required');
                user['challengeName'] = 'CUSTOM_CHALLENGE';
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            mfaRequired: (challengeName, challengeParam) => {
                logger.debug('signIn MFA required');
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            mfaSetup: (challengeName, challengeParam) => {
                logger.debug('signIn mfa setup', challengeName);
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
            },
            totpRequired: (challengeName, challengeParam) => {
                logger.debug('signIn totpRequired');
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            selectMFAType: (challengeName, challengeParam) => {
                logger.debug('signIn selectMFAType', challengeName);
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            }
        };
    }

    /**
     * Sign in with a password
     * @param {String} username - The username to be signed in
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    private signInWithPassword(username: string, password: string): Promise<CognitoUser | any> {
        const user = this.createCognitoUser(username);
        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        return new Promise((resolve, reject) => {
            user.authenticateUser(authDetails, this.authCallbacks(user, resolve, reject));
        });
    }

    /**
     * Sign in without a password
     * @param {String} username - The username to be signed in
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    private signInWithoutPassword(username: string): Promise<CognitoUser | any> {
        const user = this.createCognitoUser(username);
        user.setAuthenticationFlowType('CUSTOM_AUTH');
        const authDetails = new AuthenticationDetails({
            Username: username
        });

        return new Promise((resolve, reject) => {
            user.initiateAuth(authDetails, this.authCallbacks(user, resolve, reject));
        });
    }

    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    public confirmSignIn(
        user: CognitoUser | any, 
        code: string, 
        mfaType?: 'SMS_MFA'|'SOFTWARE_TOKEN_MFA'|null
    ): Promise<CognitoUser | any> {
        if (!code) { return Promise.reject('Code cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.sendMFACode(
                code, {
                    onSuccess: async (session) => {
                        logger.debug(session);
                        this._addSessionSource('AWSCognito');
                        try {
                            await Credentials.clear();
                            const cred = await Credentials.set(session, 'session');
                            logger.debug('succeed to get cognito credentials', cred);
                        } catch (e) {
                            logger.debug('cannot get cognito credentials', e);
                        } finally {
                            that.user = user;
                            dispatchAuthEvent('signIn', user);
                            resolve(user);
                        }
                    },
                    onFailure: (err) => {
                        logger.debug('confirm signIn failure', err);
                        reject(err);
                    }
                }, 
                mfaType);
        });
    }

    /**
     * Send the answer to a custom challenge
     * @param {CognitoUser} user - The CognitoUser object
     * @param {String} challengeResponses - The confirmation code
     */
    public sendCustomChallengeAnswer(user:CognitoUser | any, challengeResponses: string): Promise<CognitoUser | any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!challengeResponses) { return Promise.reject('Challenge response cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.sendCustomChallengeAnswer(challengeResponses, this.authCallbacks(user, resolve, reject));
        });
    }

    /*<---------------------------------- MFA Related Methods ------------------------------------>*/
    /**
     * get user current preferred mfa option
     * this method doesn't work with totp, we need to deprecate it.
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves the current preferred mfa option if success
     */
    public getMFAOptions(user : CognitoUser | any) : Promise<MFAOption[]> {
        return new Promise((res, rej) => {
            user.getMFAOptions((err, mfaOptions) => {
                if (err) {
                    logger.debug('get MFA Options failed', err);
                    rej(err);
                    return;
                }
                logger.debug('get MFA options success', mfaOptions);
                res(mfaOptions);
                return;
            });
        });
    }

    /**
     * get preferred mfa method
     * @param {CognitoUser} user - the current cognito user
     */
    public getPreferredMFA(user: CognitoUser | any): Promise<string> {
        const that = this;
        return new Promise((res, rej) => {
            user.getUserData((err, data) => {
                if (err) {
                    logger.debug('getting preferred mfa failed', err);
                    rej(err);
                    return;
                }
                
                const mfaType = that._getMfaTypeFromUserData(data);
                if (!mfaType) {
                    rej('invalid MFA Type');
                    return;
                } else {
                    res(mfaType);
                    return;
                }
            });
        });
    }

    private _getMfaTypeFromUserData(data) {
        let ret = null;
        const preferredMFA = data.PreferredMfaSetting;
        // if the user has used Auth.setPreferredMFA() to setup the mfa type
        // then the "PreferredMfaSetting" would exist in the response
        if (preferredMFA) {
            ret = preferredMFA;
        } else {
            // if mfaList exists but empty, then its noMFA
            const mfaList = data.UserMFASettingList;
            if (!mfaList) {
                // if SMS was enabled by using Auth.enableSMS(), 
                // the response would contain MFAOptions
                // as for now Cognito only supports for SMS, so we will say it is 'SMS_MFA'
                // if it does not exist, then it should be NOMFA
                const MFAOptions = data.MFAOptions;
                if (MFAOptions) {
                    ret = 'SMS_MFA';
                } else {
                    ret = 'NOMFA';
                }
            } else if (mfaList.length === 0) {
                ret = 'NOMFA';
            } else {
                logger.debug('invalid case for getPreferredMFA', data);
            }
        }
        return ret;
    }
    
    private _getUserData(user) {
        return new Promise((res, rej) => {
            user.getUserData((err, data) => {
                if (err) {
                    logger.debug('getting user data failed', err);
                    rej(err);
                    return;
                } else {
                    res(data);
                    return;
                }
            });
        });
        
    }
    /**
     * set preferred MFA method
     * @param {CognitoUser} user - the current Cognito user
     * @param {string} mfaMethod - preferred mfa method
     * @return - A promise resolve if success
     */
    public async setPreferredMFA(user : CognitoUser | any, mfaMethod : 'TOTP'|'SMS'|'NOMFA'): Promise<string> {
        const userData = await this._getUserData(user);
        let smsMfaSettings = null;
        let totpMfaSettings = null;

        switch(mfaMethod) {
            case 'TOTP' || 'SOFTWARE_TOKEN_MFA':
                totpMfaSettings = {
                    PreferredMfa : true,
                    Enabled : true
                };
                break;
            case 'SMS' || 'SMS_MFA':
                smsMfaSettings = {
                    PreferredMfa : true,
                    Enabled : true
                };
                break;
            case 'NOMFA':
                const mfaList = userData['UserMFASettingList'];
                const currentMFAType = await this._getMfaTypeFromUserData(userData);
                if (currentMFAType === 'NOMFA') {
                    return Promise.resolve('No change for mfa type');
                } else if (currentMFAType === 'SMS_MFA') {
                    smsMfaSettings = {
                        PreferredMfa : false,
                        Enabled : false
                    };
                } else if (currentMFAType === 'SOFTWARE_TOKEN_MFA') {
                    totpMfaSettings = {
                        PreferredMfa : false,
                        Enabled : false
                    };
                } else {
                    return Promise.reject('invalid MFA type');
                }
                // if there is a UserMFASettingList in the response
                // we need to disable every mfa type in that list
                if (mfaList && mfaList.length !== 0) {
                    // to disable SMS or TOTP if exists in that list
                    mfaList.forEach(mfaType => {
                        if (mfaType === 'SMS_MFA') {
                            smsMfaSettings = {
                                PreferredMfa : false,
                                Enabled : false
                            };
                        } else if (mfaType === 'SOFTWARE_TOKEN_MFA') {
                            totpMfaSettings = {
                                PreferredMfa : false,
                                Enabled : false
                            };
                        }
                    });
                }
                break;
            default:
                logger.debug('no validmfa method provided');
                return Promise.reject('no validmfa method provided');
        }

        const that = this;
        return new Promise<string>((res, rej) => {
            user.setUserMfaPreference(smsMfaSettings, totpMfaSettings, (err, result) => {
                if (err) {
                    logger.debug('Set user mfa preference error', err);
                    return rej(err);
                    
                }
                logger.debug('Set user mfa success', result);
                return res(result);
            });
        });
    }

    /**
     * diable SMS
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    public disableSMS(user : CognitoUser) : Promise<string> {
        return new Promise((res, rej) => {
            user.disableMFA((err, data) => {
                if (err) {
                    logger.debug('disable mfa failed', err);
                    rej(err);
                    return;
                }
                logger.debug('disable mfa succeed', data);
                res(data);
                return;
            });
        });
    }

    /**
     * enable SMS
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    public enableSMS(user: CognitoUser): Promise<string> {
        return new Promise((res, rej) => {
            user.enableMFA((err, data) => {
                if (err) {
                    logger.debug('enable mfa failed', err);
                    rej(err);
                    return;
                }
                logger.debug('enable mfa succeed', data);
                res(data);
                return;
            });
        });
    }

    /**
     * Setup TOTP
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves with the secret code if success
     */
    public setupTOTP(user: CognitoUser | any): Promise<string> {
        return new Promise((res, rej) => {
            user.associateSoftwareToken({
                onFailure: (err) => {
                    logger.debug('associateSoftwareToken failed', err);
                    rej(err);
                    return;
                },
                associateSecretCode: (secretCode) => {
                    logger.debug('associateSoftwareToken sucess', secretCode);
                    res(secretCode);
                    return;
                }
            });
        });
    }

    /**
     * verify TOTP setup
     * @param {CognitoUser} user - the current user
     * @param {string} challengeAnswer - challenge answer
     * @return - A promise resolves is success
     */
    public verifyTotpToken(user: CognitoUser | any, challengeAnswer: string): Promise<CognitoUserSession> {
        logger.debug('verfication totp token', user, challengeAnswer);
        return new Promise((res, rej) => {
            user.verifySoftwareToken(challengeAnswer, 'My TOTP device', {
                onFailure: (err) => {
                    logger.debug('verifyTotpToken failed', err);
                    rej(err);
                    return;
                },
                onSuccess: (data) => {
                    logger.debug('verifyTotpToken success', data);
                    res(data);
                    return;
                }
            });
        });
    }

    
    /*<---------------------------- ResetPassword Related Methods ---------------------------->*/
    public completeNewPassword(
        user: CognitoUser | any,
        password: string,
        requiredAttributes: any
    ): Promise<CognitoUser | any> {
        if (!password) { return Promise.reject('Password cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.completeNewPasswordChallenge(password, requiredAttributes, {
                onSuccess: async (session) => {
                    this._addSessionSource('AWSCognito');
                    logger.debug(session);
                    try {
                        await Credentials.clear();
                        const cred = await Credentials.set(session, 'session');
                        logger.debug('succeed to get cognito credentials', cred);
                    } catch (e) {
                        logger.debug('cannot get cognito credentials', e);
                    } finally {
                        that.user = user;
                        dispatchAuthEvent('signIn', user);
                        resolve(user);
                    }
                },
                onFailure: (err) => {
                    logger.debug('completeNewPassword failure', err);
                    dispatchAuthEvent('completeNewPassword_failure', err);
                    reject(err);
                },
                mfaRequired: (challengeName, challengeParam) => {
                    logger.debug('signIn MFA required');
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                },
                mfaSetup: (challengeName, challengeParam) => {
                    logger.debug('signIn mfa setup', challengeName);
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                }
            });
        });
    }

    /**
     * Change a password for an authenticated user
     * @param {Object} user - The CognitoUser object
     * @param {String} oldPassword - the current password
     * @param {String} newPassword - the requested new password
     * @return - A promise resolves if success
     */
    public changePassword(user: CognitoUser | any, oldPassword: string, newPassword: string): Promise<"SUCCESS"> {
        return new Promise((resolve, reject) => {
            this.userSession(user).then(session => {
                user.changePassword(oldPassword, newPassword, (err, data) => {
                    if (err) {
                        logger.debug('change password failure', err);
                        return reject(err);
                    } else {
                        return resolve(data);
                    }
                });
            });
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

        const user = this.createCognitoUser(username);
        return new Promise((resolve, reject) => {
            user.forgotPassword({
                onSuccess: () => { 
                    resolve();
                    return; 
                },
                onFailure: err => {
                    logger.debug('forgot password failure', err);
                    reject(err);
                    return;
                },
                inputVerificationCode: data => {
                    resolve(data);
                    return;
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
    ): Promise<void> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        if (!code) { return Promise.reject('Code cannot be empty'); }
        if (!password) { return Promise.reject('Password cannot be empty'); }

        const user = this.createCognitoUser(username);
        return new Promise((resolve, reject) => {
            user.confirmPassword(code, password, {
                onSuccess: () => { 
                    resolve(); 
                    return;
                },
                onFailure: err => { 
                    reject(err); 
                    return;
                }
            });
        });
    }

    
    /*<----------------------------- Attributes Related Methods -------------------------------->*/
    /**
     * Update an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise}
     **/
    public updateUserAttributes(user: CognitoUser | any, attributes:object): Promise<string> {
        const attributeList:ICognitoUserAttributeData[] = [];
        const that = this;
        return new Promise((resolve, reject) => {
            that.userSession(user).then(session => {
                for (const key in attributes) {
                    if ( key !== 'sub' &&
                        key.indexOf('_verified') < 0) {
                        const attr:ICognitoUserAttributeData = {
                            'Name': key,
                            'Value': attributes[key]
                        };
                        attributeList.push(attr);
                    }
                }
                user.updateAttributes(attributeList, (err,result) => {
                    if (err) { return reject(err); } else { return resolve(result); }
                });
            });
        });
    }
    /**
     * Return user attributes
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to user attributes if success
     */
    public userAttributes(user:CognitoUser | any): Promise<CognitoUserAttribute[]> {
        return new Promise((resolve, reject) => {
            this.userSession(user).then(session => {
                user.getUserAttributes((err, attributes) => {
                    if (err) { reject(err); } else { resolve(attributes); }
                });
            });
        });
    }

    public verifiedContact(user: CognitoUser | any) {
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
     * Initiate an attribute confirmation request
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attributes to be verified
     * @return - A promise resolves to callback data if success
     */
    public verifyUserAttribute(user: CognitoUser | any, attr: string): Promise<void> {
        return new Promise((resolve, reject) => {
            user.getAttributeVerificationCode(attr, {
                onSuccess() { return resolve(); },
                onFailure(err) { return reject(err); }
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
    public verifyUserAttributeSubmit(user: CognitoUser | any, attr: string, code: string): Promise<string> {
        if (!code) { return Promise.reject('Code cannot be empty'); }

        return new Promise((resolve, reject) => {
            user.verifyAttribute(attr, code, {
                onSuccess(data) { 
                    resolve(data); 
                    return;
                },
                onFailure(err) { 
                    reject(err); 
                    return;
                }
            });
        });
    }

    public verifyCurrentUserAttribute(attr: string): Promise<void> {
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
    verifyCurrentUserAttributeSubmit(attr: string, code: string): Promise<string> {
        const that = this;
        return that.currentUserPoolUser()
            .then(user => that.verifyUserAttributeSubmit(user, attr, code));
    }

    /*<---------------- Current User/Session/Credentials Related Methods ----------------------->*/
    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    public currentUserPoolUser(): Promise<CognitoUser | any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        const that = this;
        return new Promise((res, rej) => {
            this._storageSync.then(() => {
                const user = that.userPool.getCurrentUser();
                if (!user) { 
                    logger.debug('Failed to get user from user pool');
                    rej('No current user');
                    return;
                }

                // refresh the session if the session expired.
                user.getSession((err, session) => {
                    if (err) {
                        logger.debug('Failed to get the user session', err);
                        rej(err); 
                        return;
                    }
             
                    // get user data from Cognito
                    user.getUserData((err, data) => {
                        if (err) {
                            logger.debug('getting user data failed', err);
                            // Make sure the user is still valid
                            if (err.message === 'User is disabled' || err.message === 'User does not exist.') {
                                rej(err);
                            } else {
                                // the error may also be thrown when lack of permissions to get user info etc
                                // in that case we just bypass the error
                                res(user);
                            }
                            return;
                        }
                        const preferredMFA = data.PreferredMfaSetting || 'NOMFA';
                        const attributeList = [];

                        for (let i = 0; i < data.UserAttributes.length; i++) {
                            const attribute = {
                                Name: data.UserAttributes[i].Name,
                                Value: data.UserAttributes[i].Value,
                            };
                            const userAttribute = new CognitoUserAttribute(attribute);
                            attributeList.push(userAttribute);
                        }

                        const attributes = that.attributesToObject(attributeList);
                        Object.assign(user, {attributes, preferredMFA});
                        res(user);
                    });
                });
            }).catch(e => {
                logger.debug('Failed to sync cache info into memory', e);
                return rej(e);
            });
        });
    }

    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    public async currentAuthenticatedUser(): Promise<CognitoUser|any> {
        logger.debug('getting current authenticted user');

        await this._storageSync;
        const sessionSource = this._getSessionSource();
        if (!sessionSource || sessionSource === 'AWSCognito') {
            logger.debug('get current authenticated userpool user');
            let user = null;
            try {
                user = await this.currentUserPoolUser();
            } catch (e) {
                logger.debug('The user is not authenticated by the error', e);
                throw ('not authenticated');
            }
            this.user = user;
            return this.user;
        } else {
            const providerClass: AuthProvider = this._getProvider(sessionSource);
            try {
                this.user = await providerClass.getUser();
                return this.user;
            } catch (e) {
                logger.debug('The user is not authenticated by the error', e);
                throw ('not authenticated');
            }
        }
    }

    /**
     * Get current user's session
     * @return - A promise resolves to session object if success
     */
    public currentSession() : Promise<CognitoUserSession> {
        logger.debug('Getting current session');
        return new Promise((res, rej) => {
            this._storageSync.then(() => {
                const sessionSource = this._getSessionSource();
                if (!sessionSource || sessionSource === 'AWSCognito') {
                    if (!this.userPool) { 
                        return rej('No userPool'); 
                    }
                    this.currentUserPoolUser().then(user => {
                        this.userSession(user).then(session => {
                            return res(session);
                        }).catch(e => {
                            logger.debug('Failed to get the current session', e);
                            return rej(e);
                        });
                    }).catch(e => {
                        logger.debug('Failed to get the current user', e);
                        return rej(e);
                    });
                } else {
                    const providerClass: AuthProvider = this._getProvider(sessionSource);
                    providerClass.getSession().then(session => {
                        return res(session);
                    }).catch(e => {
                        logger.debug('Failed to get the current session', e);
                        return rej(e);
                    });
                }
            });
        });
    }

    /**
     * Get the Cognito User session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    public userSession(user) : Promise<CognitoUserSession> {
        if (!user) {
            logger.debug('the user is null');
            return Promise.reject('Failed to get the session because the user is empty');
        }
        return new Promise((resolve, reject) => {
            logger.debug('Getting the session from this user:', user);
            user.getSession(function(err, session) {
                if (err) { 
                    logger.debug('Failed to get the session from user', user);
                    reject(err);
                    return;
                } else {
                    logger.debug('Succeed to get the user session', session);
                    resolve(session); 
                    return;
                }
            });
        });
    }

    /**
     * Get  authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    public currentUserCredentials(): Promise<ICredentials> {
        logger.debug('Getting current user credentials');
        
        const sessionSource = this._getSessionSource();
        if (!sessionSource || sessionSource === 'AWSCognito') {
            return this.currentSession()
                .then(session => {
                    logger.debug('getting session success', session);
                    return Credentials.set(session, 'session');
                }).catch((error) => {
                    logger.debug('getting session failed', error);
                    return Credentials.set(null, 'guest');
                });
        } else {
            const providerClass: AuthProvider = this._getProvider(sessionSource);
            return providerClass.getSession()
                .then(session => {
                    logger.debug('getting session success', session);
                    return Credentials.set(session, 'federation');
                }).catch(error => {
                    logger.debug('getting session failed', error);
                    return Credentials.set(null, 'guest');
                });
        }
    }


    public currentCredentials(): Promise<ICredentials> {
        logger.debug('getting current credntials');
        return Credentials.get();
    }

    /**
     * Get user information
     * @async
     * @return {Object }- current User's information
     */
    public async currentUserInfo() {
        const sessionSource = this._getSessionSource();
         if (!sessionSource || sessionSource === 'AWSCognito') {
            const user = await this.currentUserPoolUser()
                .catch(err => logger.debug(err));
            if (!user) { return null; }

            try {
                const attributes = await this.userAttributes(user);
                const userAttrs:object = this.attributesToObject(attributes);
                let credentials = null;
                try {
                    credentials = await this.currentCredentials();
                } catch (e) {
                    logger.debug('Failed to retrieve credentials while getting current user info', e);
                }

                const info = {
                    'id': credentials? credentials.identityId : undefined,
                    'username': user.getUsername(),
                    'attributes': userAttrs
                };
                return info;
            } catch(err) {
                logger.debug('currentUserInfo error', err);
                return {};
            }
        } else {
            const providerClass = this._getProvider(sessionSource);
            return providerClass.getUser();
        }
    }

    /*<----------------------------- SignOut Related Methods -------------------------------->*/

    private async cognitoIdentitySignOut(opts: SignOutOpts, user: CognitoUser | any) {
        return new Promise((res, rej) => {
            if (opts && opts.global) {
                logger.debug('user global sign out', user);
                // in order to use global signout
                // we must validate the user as an authenticated user by using getSession
                user.getSession((err, result) => {
                    if (err) {
                        logger.debug('failed to get the user session', err);
                        return rej(err);
                    }
                    user.globalSignOut({
                        onSuccess: (data) => {
                            logger.debug('global sign out success');
                            if (this._cognitoAuthClient) {
                                this._cognitoAuthClient.signOut();
                            }
                            return res();
                        },
                        onFailure: (err) => {
                            logger.debug('global sign out failed', err);
                            return rej(err);
                        }   
                    });
                });
            } else {
                logger.debug('user sign out', user);
                user.signOut();
                if (this._cognitoAuthClient) {
                    this._cognitoAuthClient.signOut();
                }
                return res();
            }
        });
    }
    
    /**
     * Sign out method
     * @
     * @return - A promise resolved if success
     */
    public async signOut(opts?: SignOutOpts): Promise<any> {
        try {
            await this.cleanCachedItems();
        } catch (e) {
            logger.debug('failed to clear cached items');
        }

        await this._storageSync;
        const sessionSource = this._getSessionSource();
        this._removeSessionSource();
        if (!sessionSource || sessionSource === 'AWSCognito') {
            if (!this.userPool) {
                throw('No userPool'); 
            }
            const user = this.userPool.getCurrentUser();
            if (user) {
                await this.cognitoIdentitySignOut(opts, user);
            } else {
                logger.debug('no current Cognito user');
            }  
        } else {
            const providerClass: AuthProvider = this._getProvider(sessionSource);
            await providerClass.clearSession();
        }

        try {
            await Credentials.set(null, 'guest');
        } catch (e) {
            logger.debug('cannot load guest credentials for unauthenticated user', e);
        } finally {
            dispatchAuthEvent('signOut', this.user);
            this.user = null;
            return;
        }
    }

    private async cleanCachedItems() {
        // clear cognito cached item
        await Credentials.clear();
    }

    /**
     * @deprecated
     * For federated login
     * @param {String} provider - federation login provider
     * @param {FederatedResponse} response - response should have the access token
     * the identity id (optional)
     * and the expiration time (the universal time)
     * @param {String} user - user info
     */
    public async federatedSignIn(
        provider: 'Google'|'Facebook'|'Amazon'|'Developer'|string, 
        response: FederatedResponse, 
        user: FederatedUser
    ): Promise<ICredentials>{
        const { token, identity_id, expires_at } = response;
        let authProvider = null;
        let credentialsDomain = null;

        // for backward compatiblity
        switch(provider) {
            case 'google' || 'Google':
                authProvider = 'Google';
                credentialsDomain = 'accounts.google.com';
                break;
            case 'facebook' || 'Facebook': 
                authProvider = 'Facebook';
                credentialsDomain = 'graph.facebook.com';
                break;
            case 'amazon' || 'Amazon':
                authProvider = 'Amazon';
                credentialsDomain = 'www.amazon.com';
                break;
            case 'developer' || 'Developer':
                authProvider = 'Developer';
                credentialsDomain = 'cognito-identity.amazonaws.com';
                break;
            default:
                authProvider = 'Generic';
                credentialsDomain = provider;
                break;
        }

        const idToken = authProvider === 'Facebook' ? undefined : token;
        const accessToken = authProvider === 'Facebook' ? token : undefined;

        const { credentials } = await this.setSession({
            username: user.name,
            tokens: {
                idToken,
                accessToken,
                expires_at
            },
            identityId: identity_id,
            provider: authProvider,
            errorHandler: (e) => {
                throw e;
            },
            credentialsDomain
        });

        dispatchAuthEvent('signIn', this.user);
        logger.debug('federated sign in credentials', credentials);
        return credentials;
    }

    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    public essentialCredentials(credentials): ICredentials {
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
    
    private createCognitoUser(username: string): CognitoUser {
        const userData: ICognitoUserData = {
            Username: username,
            Pool: this.userPool,
        };
        userData.Storage = this._storage;

        const { authenticationFlowType } = this._config;
        
        const user = new CognitoUser(userData);
        if (authenticationFlowType) {
            user.setAuthenticationFlowType(authenticationFlowType);
        }
        return user;
    }


    private _getProvider(providerName) {
        const providerClass: AuthProvider = this._pluggables.filter(
            pluggable => pluggable.getProviderName() === providerName
        )[0];
        if (!providerClass) {
            throw new Error(`no provider class for ${providerName}`);
        }
        return providerClass;
    }

    private _getSessionSource() {
        return this._storage.getItem(`${this._keyPrefix}_sessionSource`);
    }

    private _removeSessionSource() {
        this._storage.removeItem(`${this._keyPrefix}_sessionSource`);
    }

    private _addSessionSource(source) {
        this._storage.setItem(`${this._keyPrefix}_sessionSource`, source);
    }

    public async setSession(params: ExternalSession): Promise<SetSessionResult> {
        const { provider } = params;
        if (!provider) {
            throw new Error('The provider property must be specified');
        }
        const providerClass: AuthProvider = this._getProvider(provider);
        if (!providerClass) {
            throw new Error(`No AuthProvider class for the provider, ${provider}`);
        }

        try {
            const result = await providerClass.setSession(params);
            this._addSessionSource(provider);
            return result;
        } catch (e) {
            throw e;
        }
    }
}
