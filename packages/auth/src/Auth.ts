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

import {
    AuthOptions,
    FederatedResponse,
    SignUpParams,
    FederatedUser,
    ConfirmSignUpOptions,
    SignOutOpts,
    CurrentUserOpts,
    GetPreferredMFAOpts,
    SignInOpts,
    isUsernamePasswordOpts,
    isCognitoHostedOpts,
    isFederatedSignInOptions,
    isFederatedSignInOptionsCustom,
    FederatedSignInOptionsCustom,
    LegacyProvider,
    FederatedSignInOptions,
    AwsCognitoOAuthOpts
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
    ICredentials,
    Platform
} from '@aws-amplify/core';
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
    CognitoUserAttribute,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoAccessToken
} from 'amazon-cognito-identity-js';

import { parse } from 'url';
import OAuth from './OAuth/OAuth';
import { default as urlListener } from './urlListener';

const logger = new Logger('AuthClass');
const USER_ADMIN_SCOPE = 'aws.cognito.signin.user.admin';

const AMPLIFY_SYMBOL = ((typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') ?
    Symbol.for('amplify_default') : '@@amplify_default') as Symbol;

const dispatchAuthEvent = (event:string, data:any, message:string) => {
    Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};

export enum CognitoHostedUIIdentityProvider {
    Cognito = 'COGNITO',
    Google = 'Google',
    Facebook = 'Facebook',
    Amazon = 'LoginWithAmazon',
}

/**
* Provide authentication steps
*/
export default class AuthClass {
    private _config: AuthOptions;
    private userPool = null;
    private user: any = null;
    private _oAuthHandler: OAuth;
    private _storage;
    private _storageSync;

    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    constructor(config: AuthOptions) {
        this.configure(config);

        this.currentUserCredentials = this.currentUserCredentials.bind(this);

        if (AWS.config) {
            AWS.config.update({ customUserAgent: Constants.userAgent });
        } else {
            logger.warn('No AWS.config');
        }

        Hub.listen('auth', ({ payload }) => {
            const { event } = payload;
            switch (event) {
                case 'signIn':
                    this._storage.setItem('amplify-signin-with-hostedUI', 'false');
                    break;
                case 'signOut':
                    this._storage.removeItem('amplify-signin-with-hostedUI');
                    break;
                case 'cognitoHostedUI':
                    this._storage.setItem('amplify-signin-with-hostedUI', 'true');
                    break;
            }
        });
    }

    public getModuleName() {
        return 'Auth';
    }

    configure(config) {
        if (!config) return this._config || {};
        logger.debug('configure Auth');
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
            identityPoolRegion
        } = this._config;

        if (!this._config.storage) {
            // backward compatbility
            if (cookieStorage) this._storage = new CookieStorage(cookieStorage);
            else {
                this._storage = new StorageHelper().getStorage();
            }
        } else {
            if (!this._isValidAuthStorage(this._config.storage)) {
                logger.error('The storage in the Auth config is not valid!');
                throw new Error('Empty storage object');
            }
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
            storage: this._storage
        });

        // initiailize cognitoauth client if hosted ui options provided
        // to keep backward compatibility:
        const cognitoHostedUIConfig = oauth? (isCognitoHostedOpts(this._config.oauth)
            ? oauth : (<any>oauth).awsCognito)
            : undefined;

        if (cognitoHostedUIConfig) {
            const cognitoAuthParams = Object.assign(
                {
                    cognitoClientId: userPoolWebClientId,
                    UserPoolId: userPoolId,
                    domain: cognitoHostedUIConfig['domain'],
                    scopes: cognitoHostedUIConfig['scope'],
                    redirectSignIn: cognitoHostedUIConfig['redirectSignIn'],
                    redirectSignOut: cognitoHostedUIConfig['redirectSignOut'],
                    responseType: cognitoHostedUIConfig['responseType'],
                    Storage: this._storage,
                    urlOpener: cognitoHostedUIConfig['urlOpener']
                },
                cognitoHostedUIConfig['options']
            );

            this._oAuthHandler = new OAuth({
                scopes: cognitoAuthParams.scopes,
                config: cognitoAuthParams,
                cognitoClientId: cognitoAuthParams.cognitoClientId
            });

            // **NOTE** - Remove this in a future major release as it is a breaking change
            urlListener(({ url }) => {
                this._handleAuthResponse(url);
            });
        }

        dispatchAuthEvent(
            'configured',
            null,
            `The Auth category has been configured successfully`
        );
        return this._config;
    }

    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String | object} params - The user attirbutes used for signin
     * @param {String[]} restOfAttrs - for the backward compatability
     * @return - A promise resolves callback data if success
     */
    public signUp(params: string | SignUpParams, ...restOfAttrs: string[]): Promise<ISignUpResult> {
        if (!this.userPool) { return Promise.reject('No userPool'); }

        let username: string = null;
        let password: string = null;
        const attributes: object[] = [];
        let validationData: object[] = null;
        if (params && typeof params === 'string') {
            username = params;
            password = restOfAttrs ? restOfAttrs[0] : null;
            const email: string = restOfAttrs ? restOfAttrs[1] : null;
            const phone_number: string = restOfAttrs ? restOfAttrs[2] : null;
            if (email) attributes.push({ Name: 'email', Value: email });
            if (phone_number) attributes.push({ Name: 'phone_number', Value: phone_number });
        } else if (params && typeof params === 'object') {
            username = params['username'];
            password = params['password'];
            const attrs = params['attributes'];
            if (attrs) {
                Object.keys(attrs).map(key => {
                    const ele: object = { Name: key, Value: attrs[key] };
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
            this.userPool.signUp(username, password, attributes, validationData, (err, data) => {
                if (err) {
                    dispatchAuthEvent(
                        'signUp_failure',
                        err,
                        `${username} failed to signup`
                    );
                    reject(err);
                } else {
                    dispatchAuthEvent(
                        'signUp',
                        data,
                        `${username} has signed up successfully`
                    );
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
            user.confirmRegistration(code, forceAliasCreation, (err, data) => {
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
            user.resendConfirmationCode((err, data) => {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    /**
     * Sign in
     * @param {String | SignInOpts} usernameOrSignInOpts - The username to be signed in or the sign in options
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser
     */
    public signIn(usernameOrSignInOpts: string | SignInOpts, pw?: string): Promise<CognitoUser | any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        let username = null;
        let password = null;
        let validationData = {};
        // for backward compatibility
        if (typeof usernameOrSignInOpts === 'string') {
            username = usernameOrSignInOpts;
            password = pw;
        } else if (isUsernamePasswordOpts(usernameOrSignInOpts)) {
            if (typeof pw !== 'undefined') {
                logger.warn('The password should be defined under the first parameter object!');
            }
            username = usernameOrSignInOpts.username;
            password = usernameOrSignInOpts.password;
            validationData = usernameOrSignInOpts.validationData;
        } else {
            return Promise.reject(new Error('The username should either be a string or one of the sign in types'));
        }
        if (!username) { return Promise.reject('Username cannot be empty'); }
        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
            ValidationData: validationData
        });
        if (password) {
            return this.signInWithPassword(authDetails);
        } else {
            return this.signInWithoutPassword(authDetails);
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
                logger.debug(session);
                delete (user['challengeName']);
                delete (user['challengeParam']);
                try {
                    await Credentials.clear();
                    const cred = await Credentials.set(session, 'session');
                    logger.debug('succeed to get cognito credentials', cred);
                } catch (e) {
                    logger.debug('cannot get cognito credentials', e);
                } finally {
                try {
                        // In order to get user attributes and MFA methods
                        // We need to trigger currentUserPoolUser again
                        const currentUser = await this.currentUserPoolUser();
                        that.user = currentUser;
                        dispatchAuthEvent(
                        'signIn',
                        currentUser,
                        `A user ${user.getUsername()} has been signed in`
                    );
                        resolve(currentUser);
                    } catch (e) {
                        logger.error('Failed to get the signed in user', e);
                        reject(e);
                    }
                }
            },
            onFailure: (err) => {
                logger.debug('signIn failure', err);
                dispatchAuthEvent(
                    'signIn_failure',
                    err,
                    `${user.getUsername()} failed to signin`
                );
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
     * @private
     * @param {AuthenticationDetails} authDetails - the user sign in data
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    private signInWithPassword(authDetails: AuthenticationDetails): Promise<CognitoUser | any> {
        const user = this.createCognitoUser(authDetails.getUsername());

        return new Promise((resolve, reject) => {
            user.authenticateUser(authDetails, this.authCallbacks(user, resolve, reject));
        });
    }

    /**
     * Sign in without a password
     * @private
     * @param {AuthenticationDetails} authDetails - the user sign in data
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    private signInWithoutPassword(authDetails: AuthenticationDetails): Promise<CognitoUser | any> {
        const user = this.createCognitoUser(authDetails.getUsername());
        user.setAuthenticationFlowType('CUSTOM_AUTH');

        return new Promise((resolve, reject) => {
            user.initiateAuth(authDetails, this.authCallbacks(user, resolve, reject));
        });
    }

    /**
     * get user current preferred mfa option
     * this method doesn't work with totp, we need to deprecate it.
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves the current preferred mfa option if success
     */
    public getMFAOptions(user: CognitoUser | any): Promise<MFAOption[]> {
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
     * @param {GetPreferredMFAOpts} params - options for getting the current user preferred MFA
     */
    public getPreferredMFA(user: CognitoUser | any, params?: GetPreferredMFAOpts): Promise<string> {
        const that = this;
        return new Promise((res, rej) => {
            const bypassCache = params? params.bypassCache: false;
            user.getUserData(
                (err, data) => {
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
                },
                { bypassCache }
            );
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

    private _getUserData(user, params) {
        return new Promise((res, rej) => {
            user.getUserData(
                (err, data) => {
                    if (err) {
                        logger.debug('getting user data failed', err);
                        rej(err);
                        return;
                    } else {
                        res(data);
                        return;
                    }
                },
                params
            );
        });

    }

    /**
     * set preferred MFA method
     * @param {CognitoUser} user - the current Cognito user
     * @param {string} mfaMethod - preferred mfa method
     * @return - A promise resolve if success
     */
    public async setPreferredMFA(user: CognitoUser | any, mfaMethod: 'TOTP' | 'SMS' | 'NOMFA'): Promise<string> {
        const userData = await this._getUserData(user, { bypassCache: true });
        let smsMfaSettings = null;
        let totpMfaSettings = null;

        switch (mfaMethod) {
            case 'TOTP' || 'SOFTWARE_TOKEN_MFA':
                totpMfaSettings = {
                    PreferredMfa: true,
                    Enabled: true
                };
                break;
            case 'SMS' || 'SMS_MFA':
                smsMfaSettings = {
                    PreferredMfa: true,
                    Enabled: true
                };
                break;
            case 'NOMFA':
                const mfaList = userData['UserMFASettingList'];
                const currentMFAType = await this._getMfaTypeFromUserData(userData);
                if (currentMFAType === 'NOMFA') {
                    return Promise.resolve('No change for mfa type');
                } else if (currentMFAType === 'SMS_MFA') {
                    smsMfaSettings = {
                        PreferredMfa: false,
                        Enabled: false
                    };
                } else if (currentMFAType === 'SOFTWARE_TOKEN_MFA') {
                    totpMfaSettings = {
                        PreferredMfa: false,
                        Enabled: false
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
                                PreferredMfa: false,
                                Enabled: false
                            };
                        } else if (mfaType === 'SOFTWARE_TOKEN_MFA') {
                            totpMfaSettings = {
                                PreferredMfa: false,
                                Enabled: false
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
                logger.debug('Caching the latest user data into local');
                // cache the latest result into user data
                user.getUserData(
                    (err, data) => {
                        if (err) {
                            logger.debug('getting user data failed', err);
                            return rej(err);
                        } else {
                            return res(result);
                        }
                    },
                    {bypassCache: true}
                );
            });
        });
    }

    /**
     * diable SMS
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    public disableSMS(user: CognitoUser): Promise<string> {
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

    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    public confirmSignIn(
        user: CognitoUser | any,
        code: string,
        mfaType?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA' | null
    ): Promise<CognitoUser | any> {
        if (!code) { return Promise.reject('Code cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.sendMFACode(
                code, {
                    onSuccess: async (session) => {
                        logger.debug(session);
                        try {
                            await Credentials.clear();
                            const cred = await Credentials.set(session, 'session');
                            logger.debug('succeed to get cognito credentials', cred);
                        } catch (e) {
                            logger.debug('cannot get cognito credentials', e);
                        } finally {
                            that.user = user;

                            dispatchAuthEvent(
                                'signIn',
                                user,
                                `${user} has signed in`
                            );
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
                    logger.debug(session);
                    try {
                        await Credentials.clear();
                        const cred = await Credentials.set(session, 'session');
                        logger.debug('succeed to get cognito credentials', cred);
                    } catch (e) {
                        logger.debug('cannot get cognito credentials', e);
                    } finally {
                        that.user = user;
                        dispatchAuthEvent(
                            'signIn',
                            user, `${user} has signed in`
                        );
                        resolve(user);
                    }
                },
                onFailure: (err) => {
                    logger.debug('completeNewPassword failure', err);
                    dispatchAuthEvent(
                        'completeNewPassword_failure',
                        err,
                        `${this.user} failed to complete the new password flow`
                    );
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
     * Send the answer to a custom challenge
     * @param {CognitoUser} user - The CognitoUser object
     * @param {String} challengeResponses - The confirmation code
     */
    public sendCustomChallengeAnswer(user: CognitoUser | any, challengeResponses: string): Promise<CognitoUser | any> {
        if (!this.userPool) { return Promise.reject('No userPool'); }
        if (!challengeResponses) { return Promise.reject('Challenge response cannot be empty'); }

        const that = this;
        return new Promise((resolve, reject) => {
            user.sendCustomChallengeAnswer(challengeResponses, this.authCallbacks(user, resolve, reject));
        });
    }

    /**
     * Update an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise}
     **/
    public updateUserAttributes(user: CognitoUser | any, attributes: object): Promise<string> {
        const attributeList: ICognitoUserAttributeData[] = [];
        const that = this;
        return new Promise((resolve, reject) => {
            that.userSession(user).then(session => {
                for (const key in attributes) {
                    if (key !== 'sub' &&
                        key.indexOf('_verified') < 0) {
                        const attr: ICognitoUserAttributeData = {
                            'Name': key,
                            'Value': attributes[key]
                        };
                        attributeList.push(attr);
                    }
                }
                user.updateAttributes(attributeList, (err, result) => {
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
    public userAttributes(user: CognitoUser | any): Promise<CognitoUserAttribute[]> {
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
     * Get current authenticated user
     * @return - A promise resolves to current authenticated CognitoUser if success
     */
    public currentUserPoolUser(params?: CurrentUserOpts): Promise<CognitoUser | any> {
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
                    const bypassCache = params ? params.bypassCache : false;
                    // validate the token's scope fisrt before calling this function
                    const { scope = '' } = session.getAccessToken().decodePayload();
                    if (scope.split(' ').includes(USER_ADMIN_SCOPE)) {
                        user.getUserData(
                            (err, data) => {
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
                                Object.assign(user, { attributes, preferredMFA });
                                return res(user);
                            },
                            { bypassCache }
                        );
                    } else {
                        logger.debug(`Unable to get the user data because the ${USER_ADMIN_SCOPE} ` +
                            `is not in the scopes of the access token`);
                        return res(user);
                    }
                });
            }).catch(e => {
                logger.debug('Failed to sync cache info into memory', e);
                return rej(e);
            });
        });
    }

    /**
     * Get current authenticated user
     * @param {CurrentUserOpts} - options for getting the current user
     * @return - A promise resolves to current authenticated CognitoUser if success
     */
    public async currentAuthenticatedUser(params?: CurrentUserOpts): Promise<CognitoUser | any> {
        logger.debug('getting current authenticted user');
        let federatedUser = null;
        try {
            await this._storageSync;
        } catch (e) {
            logger.debug('Failed to sync cache info into memory', e);
            throw e;
        }

        try {
            federatedUser = JSON.parse(this._storage.getItem('aws-amplify-federatedInfo')).user;
        } catch (e) {
            logger.debug('cannot load federated user from auth storage');
        }

        if (federatedUser) {
            this.user = federatedUser;
            logger.debug('get current authenticated federated user', this.user);
            return this.user;
        } else {
            logger.debug('get current authenticated userpool user');
            let user = null;
            try {
                user = await this.currentUserPoolUser(params);
            } catch (e) {
                if (e === 'No userPool') {
                    logger.error('Cannot get the current user because the user pool is missing. ' +
                        'Please make sure the Auth module is configured with a valid Cognito User Pool ID');
                }
                logger.debug('The user is not authenticated by the error', e);
                throw ('not authenticated');
            }
            this.user = user;
            return this.user;
        }
    }

    /**
     * Get current user's session
     * @return - A promise resolves to session object if success
     */
    public currentSession(): Promise<CognitoUserSession> {
        const that = this;
        logger.debug('Getting current session');
        if (!this.userPool) { return Promise.reject('No userPool'); }

        return new Promise((res, rej) => {
            that.currentUserPoolUser().then(user => {
                that.userSession(user).then(session => {
                    res(session);
                    return;
                }).catch(e => {
                    logger.debug('Failed to get the current session', e);
                    rej(e);
                    return;
                });
            }).catch(e => {
                logger.debug('Failed to get the current user', e);
                rej(e);
                return;
            });
        });
    }

    /**
     * Get the corresponding user session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    public userSession(user): Promise<CognitoUserSession> {
        if (!user) {
            logger.debug('the user is null');
            return Promise.reject('Failed to get the session because the user is empty');
        }
        return new Promise((resolve, reject) => {
            logger.debug('Getting the session from this user:', user);
            user.getSession((err, session) => {
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
    public async currentUserCredentials(): Promise<ICredentials> {
        const that = this;
        logger.debug('Getting current user credentials');

        try {
            await this._storageSync;
        } catch (e) {
            logger.debug('Failed to sync cache info into memory', e);
            throw e;
        }

        // first to check whether there is federation info in the auth storage
        let federatedInfo = null;
        try {
            federatedInfo = JSON.parse(this._storage.getItem('aws-amplify-federatedInfo'));
        } catch (e) {
            logger.debug('failed to get or parse item aws-amplify-federatedInfo', e);
        }

        if (federatedInfo) {
            // refresh the jwt token here if necessary
            return Credentials.refreshFederatedToken(federatedInfo);
        } else {
            return this.currentSession()
                .then(session => {
                    logger.debug('getting session success', session);
                    return Credentials.set(session, 'session');
                }).catch((error) => {
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

    private async cognitoIdentitySignOut(opts: SignOutOpts, user: CognitoUser | any) {
        try {
            await this._storageSync;
        } catch (e) {
            logger.debug('Failed to sync cache info into memory', e);
            throw e;
        }

        const isSignedInHostedUI = this._oAuthHandler
            && this._storage.getItem('amplify-signin-with-hostedUI') === 'true';

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
                            if (isSignedInHostedUI) {
                                return res(this._oAuthHandler.signOut());
                            } else {
                                return res();
                            }
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
                if (isSignedInHostedUI) {
                    return res(this._oAuthHandler.signOut());
                } else {
                    return res();
                }
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

        if (this.userPool) {
            const user = this.userPool.getCurrentUser();
            if (user) {
                await this.cognitoIdentitySignOut(opts, user);
            } else {
                logger.debug('no current Cognito user');
            }
        } else {
            logger.debug('no Congito User pool');
        }

        /**
         * Note for future refactor - no reliable way to get username with
         * Cognito User Pools vs Identity when federating with Social Providers
         * This is why we need a well structured session object that can be inspected
         * and information passed back in the message below for Hub dispatch
        */
        dispatchAuthEvent(
            'signOut',
            this.user,
            `A user has been signed out`
        );
        this.user = null;
    }

    private async cleanCachedItems() {
        // clear cognito cached item
        await Credentials.clear();
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

    /**
     * Get user information
     * @async
     * @return {Object }- current User's information
     */
    public async currentUserInfo() {
        const source = Credentials.getCredSource();

        if (!source || source === 'aws' || source === 'userPool') {
            const user = await this.currentUserPoolUser()
                .catch(err => logger.debug(err));
            if (!user) { return null; }

            try {
                const attributes = await this.userAttributes(user);
                const userAttrs: object = this.attributesToObject(attributes);
                let credentials = null;
                try {
                    credentials = await this.currentCredentials();
                } catch (e) {
                    logger.debug('Failed to retrieve credentials while getting current user info', e);
                }


                const info = {
                    'id': credentials ? credentials.identityId : undefined,
                    'username': user.getUsername(),
                    'attributes': userAttrs
                };
                return info;
            } catch (err) {
                logger.debug('currentUserInfo error', err);
                return {};
            }
        }

        if (source === 'federated') {
            const user = this.user;
            return user ? user : {};
        }
    }


    public async federatedSignIn(options?: FederatedSignInOptions):
        Promise<ICredentials>;
    public async federatedSignIn(
        provider: LegacyProvider,
        response: FederatedResponse,
        user: FederatedUser
    ): Promise<ICredentials>;
    public async federatedSignIn(options?: FederatedSignInOptionsCustom):
        Promise<ICredentials>;
    public async federatedSignIn(
        providerOrOptions: LegacyProvider | FederatedSignInOptions | FederatedSignInOptionsCustom,
        response?: FederatedResponse,
        user?: FederatedUser
    ): Promise<ICredentials> {


        if (!this._config.identityPoolId && !this._config.userPoolId) {
            throw new Error(`Federation requires either a User Pool or Identity Pool in config`);
        }

        // Ensure backwards compatability
        if (typeof providerOrOptions === 'undefined') {
            if (this._config.identityPoolId && !this._config.userPoolId) {
                throw new Error(`Federation with Identity Pools requires tokens passed as arguments`);
            }
        }

        if (isFederatedSignInOptions(providerOrOptions)
            || isFederatedSignInOptionsCustom(providerOrOptions)
            || typeof providerOrOptions === 'undefined') {

            const options = providerOrOptions || { provider: CognitoHostedUIIdentityProvider.Cognito };
            const provider = isFederatedSignInOptions(options)
                ? options.provider
                : (options as FederatedSignInOptionsCustom).customProvider;

            const customState = isFederatedSignInOptions(options)
                ? options.customState
                : (options as FederatedSignInOptionsCustom).customState;

            if (this._config.userPoolId) {
                const client_id = isCognitoHostedOpts(this._config.oauth)
                    ? this._config.userPoolWebClientId
                    : this._config.oauth.clientID;
                /*Note: Invenstigate automatically adding trailing slash */
                const redirect_uri = isCognitoHostedOpts(this._config.oauth)
                    ? this._config.oauth.redirectSignIn
                    : this._config.oauth.redirectUri;

                this._oAuthHandler.oauthSignIn(
                    this._config.oauth.responseType,
                    this._config.oauth.domain,
                    redirect_uri,
                    client_id,
                    provider,
                    customState);

            }
        } else {

            const provider = providerOrOptions;
            // To check if the user is already logged in
            try {
                const loggedInUser = await this.currentAuthenticatedUser();
                logger.warn(`There is already a signed in user: ${loggedInUser} in your app.
                You should not call Auth.federatedSignIn method again as it may cause unexpected behavior.`);
            } catch (e) { }

            const { token, identity_id, expires_at } = response;
            // Because Credentials.set would update the user info with identity id
            // So we need to retrieve the user again.
            const credentials = await Credentials.set(
                { provider, token, identity_id, user, expires_at },
                'federation'
            );
            const currentUser = await this.currentAuthenticatedUser();
            dispatchAuthEvent(
                'signIn',
                currentUser,
                `A user ${currentUser.username} has been signed in`
            );
            logger.debug('federated sign in credentials', credentials);
            return credentials;
        }
    }

    /**
     * Used to complete the OAuth flow with or without the Cognito Hosted UI
     * @param {String} URL - optional parameter for customers to pass in the response URL
     */
    private async _handleAuthResponse(URL?: string) {

        if (!this._config.userPoolId){
            throw new Error(`OAuth responses require a User Pool defined in config`);
        }

        dispatchAuthEvent(
            'parsingCallbackUrl', 
            { url: URL },
            `The callback url is being parsed`
        );

        const currentUrl = URL || (JS.browserOrNode().isBrowser ? window.location.href : '');

        const hasCodeOrError = !!(parse(currentUrl).query || '')
            .split('&')
            .map(entry => entry.split('='))
            .find(([k]) => k === 'code' || k === 'error');

        const hasTokenOrError = !!(parse(currentUrl).hash || '#')
            .substr(1)
            .split('&')
            .map(entry => entry.split('='))
            .find(([k]) => k === 'access_token' || k === 'error');


        if (hasCodeOrError || hasTokenOrError) {
            try {

                const {
                    accessToken,
                    idToken,
                    refreshToken,
                    state } = await this._oAuthHandler.handleAuthResponse(currentUrl);
                const session = new CognitoUserSession({
                    IdToken: new CognitoIdToken({ IdToken: idToken }),
                    RefreshToken: new CognitoRefreshToken({ RefreshToken: refreshToken }),
                    AccessToken: new CognitoAccessToken({ AccessToken: accessToken })
                });

                let credentials;
                // Get AWS Credentials & store if Identity Pool is defined
                if (this._config.identityPoolId) {
                    credentials = await Credentials.set(session, 'session');
                    logger.debug('AWS credentials', credentials);
                }

                /* 
                Prior to the request we do sign the custom state along with the state we set. This check will verify
                if there is a dash indicated when setting custom state from the request. If a dash is contained
                then there is custom state present on the state string.
                */
                const isCustomStateIncluded = /-/.test(state);

                /*The following is to create a user for the Cognito Identity SDK to store the tokens
                  When we remove this SDK later that logic will have to be centralized in our new version*/
                //#region
                const currentUser = this.createCognitoUser(session.getIdToken().decodePayload()['cognito:username']);
                dispatchAuthEvent(
                    'signIn',
                    currentUser,
                    `A user ${currentUser.getUsername()} has been signed in`
                );
                dispatchAuthEvent(
                    'cognitoHostedUI',
                    currentUser,
                    `A user ${currentUser.getUsername()} has been signed in via Cognito Hosted UI`
                );
                
                if (isCustomStateIncluded) {
                    const [, customState] = state.split('-');

                    dispatchAuthEvent(
                        'customOAuthState',
                        customState,
                        `State for user ${currentUser.getUsername()}`
                    );
                }

                // This calls cacheTokens() in Cognito SDK
                currentUser.setSignInUserSession(session);
                //#endregion

                if (window && typeof window.history !== 'undefined') {
                    window.history.replaceState({}, null, (this._config.oauth as AwsCognitoOAuthOpts).redirectSignIn);
                }

                return credentials;
            } catch (err) {
                logger.debug("Error in cognito hosted auth response", err);
                dispatchAuthEvent(
                    'signIn_failure',
                    err,
                    `The OAuth response flow failed`
                );
                dispatchAuthEvent(
                    'cognitoHostedUI_failure',
                    err,
                    `A failure occurred when returning to the Cognito Hosted UI`
                );
                dispatchAuthEvent(
                    'customState_failure',
                    err,
                    `A failure occurred when returning state`
                );
                throw err;
            }
        }

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

    private _isValidAuthStorage(obj) {
        // We need to check if the obj has the functions of Storage
        return !!obj &&
            typeof obj.getItem === 'function' &&
            typeof obj.setItem === 'function' &&
            typeof obj.removeItem === 'function' &&
            typeof obj.clear === 'function';
    }
}
