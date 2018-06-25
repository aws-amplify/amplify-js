"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("../Common");
var Platform_1 = require("../Common/Platform");
var Cache_1 = require("../Cache");
require("../Common/Polyfills");
var logger = new Common_1.ConsoleLogger('AuthClass');
var CognitoAuth = Common_1.CognitoHostedUI.CognitoAuth;
var CookieStorage = Common_1.Cognito.CookieStorage, CognitoUserPool = Common_1.Cognito.CognitoUserPool, CognitoUserAttribute = Common_1.Cognito.CognitoUserAttribute, CognitoUser = Common_1.Cognito.CognitoUser, AuthenticationDetails = Common_1.Cognito.AuthenticationDetails;
var dispatchAuthEvent = function (event, data) {
    Common_1.Hub.dispatch('auth', { event: event, data: data }, 'Auth');
};
/**
* Provide authentication steps
*/
var AuthClass = /** @class */ (function () {
    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    function AuthClass(config) {
        this.userPool = null;
        this._cognitoAuthClient = null;
        this.user = null;
        this._gettingCredPromise = null;
        this.configure(config);
        this.currentUserCredentials = this.currentUserCredentials.bind(this);
        if (Common_1.AWS.config) {
            Common_1.AWS.config.update({ customUserAgent: Common_1.Constants.userAgent });
        }
        else {
            logger.warn('No AWS.config');
        }
    }
    AuthClass.prototype.configure = function (config) {
        var _this = this;
        if (!config)
            return this._config || {};
        logger.debug('configure Auth');
        var conf = Object.assign({}, this._config, Common_1.Parser.parseMobilehubConfig(config).Auth, config);
        this._config = conf;
        if (!this._config.identityPoolId) {
            logger.debug('Do not have identityPoolId yet.');
        }
        var _a = this._config, userPoolId = _a.userPoolId, userPoolWebClientId = _a.userPoolWebClientId, cookieStorage = _a.cookieStorage, oauth = _a.oauth, region = _a.region, identityPoolId = _a.identityPoolId, mandatorySignIn = _a.mandatorySignIn, refreshHandlers = _a.refreshHandlers;
        if (userPoolId) {
            var userPoolData = {
                UserPoolId: userPoolId,
                ClientId: userPoolWebClientId,
            };
            if (cookieStorage) {
                userPoolData.Storage = new CookieStorage(cookieStorage);
            }
            this.userPool = new CognitoUserPool(userPoolData);
            if (Platform_1.default.isReactNative) {
                var that = this;
                this._userPoolStorageSync = new Promise(function (resolve, reject) {
                    _this.userPool.storage.sync(function (err, data) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
            }
        }
        Common_1.Credentials.configure({
            mandatorySignIn: mandatorySignIn,
            region: region,
            userPoolId: userPoolId,
            identityPoolId: identityPoolId,
            refreshHandlers: refreshHandlers
        });
        // initiailize cognitoauth client if hosted ui options provided
        if (oauth) {
            var that_1 = this;
            var cognitoAuthParams = Object.assign({
                ClientId: userPoolWebClientId,
                UserPoolId: userPoolId,
                AppWebDomain: oauth.domain,
                TokenScopesArray: oauth.scope,
                RedirectUriSignIn: oauth.redirectSignIn,
                RedirectUriSignOut: oauth.redirectSignOut,
                ResponseType: oauth.responseType,
                Storage: this.userPool.Storage
            }, oauth.options);
            logger.debug('cognito auth params', cognitoAuthParams);
            this._cognitoAuthClient = new CognitoAuth(cognitoAuthParams);
            this._cognitoAuthClient.userhandler = {
                // user signed in
                onSuccess: function (result) {
                    that_1.user = that_1.userPool.getCurrentUser();
                    logger.debug("Cognito Hosted authentication result", result);
                    that_1.currentSession().then(function (session) { return __awaiter(_this, void 0, void 0, function () {
                        var cred, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, 3, 4]);
                                    return [4 /*yield*/, Common_1.Credentials.set(session, 'session')];
                                case 1:
                                    cred = _a.sent();
                                    logger.debug('sign in succefully with', cred);
                                    return [3 /*break*/, 4];
                                case 2:
                                    e_1 = _a.sent();
                                    logger.debug('sign in without aws credentials', e_1);
                                    return [3 /*break*/, 4];
                                case 3:
                                    dispatchAuthEvent('signIn', that_1.user);
                                    dispatchAuthEvent('cognitoHostedUI', that_1.user);
                                    return [7 /*endfinally*/];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                },
                onFailure: function (err) {
                    logger.debug("Error in cognito hosted auth response", err);
                }
            };
            // if not logged in, try to parse the url.
            this.currentAuthenticatedUser().then(function () {
                logger.debug('user already logged in');
            }).catch(function (e) {
                logger.debug('not logged in, try to parse the url');
                var curUrl = window.location.href;
                _this._cognitoAuthClient.parseCognitoWebResponse(curUrl);
            });
        }
        dispatchAuthEvent('configured', null);
        return this._config;
    };
    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String | object} params - The user attirbutes used for signin
     * @param {String[]} restOfAttrs - for the backward compatability
     * @return - A promise resolves callback data if success
     */
    AuthClass.prototype.signUp = function (params) {
        var _this = this;
        var restOfAttrs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            restOfAttrs[_i - 1] = arguments[_i];
        }
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        var username = null;
        var password = null;
        var attributes = [];
        var validationData = null;
        if (params && typeof params === 'string') {
            username = params;
            password = restOfAttrs ? restOfAttrs[0] : null;
            var email = restOfAttrs ? restOfAttrs[1] : null;
            var phone_number = restOfAttrs ? restOfAttrs[2] : null;
            if (email)
                attributes.push({ Name: 'email', Value: email });
            if (phone_number)
                attributes.push({ Name: 'phone_number', Value: phone_number });
        }
        else if (params && typeof params === 'object') {
            username = params['username'];
            password = params['password'];
            var attrs_1 = params['attributes'];
            if (attrs_1) {
                Object.keys(attrs_1).map(function (key) {
                    var ele = { Name: key, Value: attrs_1[key] };
                    attributes.push(ele);
                });
            }
            validationData = params['validationData'] || null;
        }
        else {
            return Promise.reject('The first parameter should either be non-null string or object');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (!password) {
            return Promise.reject('Password cannot be empty');
        }
        logger.debug('signUp attrs:', attributes);
        logger.debug('signUp validation data:', validationData);
        return new Promise(function (resolve, reject) {
            _this.userPool.signUp(username, password, attributes, validationData, function (err, data) {
                if (err) {
                    dispatchAuthEvent('signUp_failure', err);
                    reject(err);
                }
                else {
                    dispatchAuthEvent('signUp', data);
                    resolve(data);
                }
            });
        });
    };
    /**
     * Send the verfication code to confirm sign up
     * @param {String} username - The username to be confirmed
     * @param {String} code - The verification code
     * @param {ConfirmSignUpOptions} options - other options for confirm signup
     * @return - A promise resolves callback data if success
     */
    AuthClass.prototype.confirmSignUp = function (username, code, options) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (!code) {
            return Promise.reject('Code cannot be empty');
        }
        var user = this.createCognitoUser(username);
        var forceAliasCreation = options && typeof options.forceAliasCreation === 'boolean'
            ? options.forceAliasCreation : true;
        return new Promise(function (resolve, reject) {
            user.confirmRegistration(code, forceAliasCreation, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /**
     * Resend the verification code
     * @param {String} username - The username to be confirmed
     * @return - A promise resolves data if success
     */
    AuthClass.prototype.resendSignUp = function (username) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        var user = this.createCognitoUser(username);
        return new Promise(function (resolve, reject) {
            user.resendConfirmationCode(function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /**
     * Sign in
     * @param {String} username - The username to be signed in
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser
     */
    AuthClass.prototype.signIn = function (username, password) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (password) {
            return this.signInWithPassword(username, password);
        }
        else {
            return this.signInWithoutPassword(username);
        }
    };
    /**
     * Return an object with the authentication callbacks
     * @param {CognitoUser} user - the cognito user object
     * @param {} resolve - function called when resolving the current step
     * @param {} reject - function called when rejecting the current step
     * @return - an object with the callback methods for user authentication
     */
    AuthClass.prototype.authCallbacks = function (user, resolve, reject) {
        var _this = this;
        var that = this;
        return {
            onSuccess: function (session) { return __awaiter(_this, void 0, void 0, function () {
                var cred, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            logger.debug(session);
                            delete (user['challengeName']);
                            delete (user['challengeParam']);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, Common_1.Credentials.set(session, 'session')];
                        case 2:
                            cred = _a.sent();
                            logger.debug('succeed to get cognito credentials', cred);
                            return [3 /*break*/, 5];
                        case 3:
                            e_2 = _a.sent();
                            logger.debug('cannot get cognito credentials', e_2);
                            return [3 /*break*/, 5];
                        case 4:
                            that.user = user;
                            dispatchAuthEvent('signIn', user);
                            resolve(user);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            }); },
            onFailure: function (err) {
                logger.debug('signIn failure', err);
                dispatchAuthEvent('signIn_failure', err);
                reject(err);
            },
            customChallenge: function (challengeParam) {
                logger.debug('signIn custom challenge answer required');
                user['challengeName'] = 'CUSTOM_CHALLENGE';
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            mfaRequired: function (challengeName, challengeParam) {
                logger.debug('signIn MFA required');
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            mfaSetup: function (challengeName, challengeParam) {
                logger.debug('signIn mfa setup', challengeName);
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                logger.debug('signIn new password');
                user['challengeName'] = 'NEW_PASSWORD_REQUIRED';
                user['challengeParam'] = {
                    userAttributes: userAttributes,
                    requiredAttributes: requiredAttributes
                };
                resolve(user);
            },
            totpRequired: function (challengeName, challengeParam) {
                logger.debug('signIn totpRequired');
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            selectMFAType: function (challengeName, challengeParam) {
                logger.debug('signIn selectMFAType', challengeName);
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            }
        };
    };
    /**
     * Sign in with a password
     * @param {String} username - The username to be signed in
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    AuthClass.prototype.signInWithPassword = function (username, password) {
        var _this = this;
        var user = this.createCognitoUser(username);
        var authDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });
        return new Promise(function (resolve, reject) {
            user.authenticateUser(authDetails, _this.authCallbacks(user, resolve, reject));
        });
    };
    /**
     * Sign in without a password
     * @param {String} username - The username to be signed in
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    AuthClass.prototype.signInWithoutPassword = function (username) {
        var _this = this;
        var user = this.createCognitoUser(username);
        user.setAuthenticationFlowType('CUSTOM_AUTH');
        var authDetails = new AuthenticationDetails({
            Username: username,
        });
        return new Promise(function (resolve, reject) {
            user.initiateAuth(authDetails, _this.authCallbacks(user, resolve, reject));
        });
    };
    /**
     * get user current preferred mfa option
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves the current preferred mfa option if success
     */
    AuthClass.prototype.getMFAOptions = function (user) {
        return new Promise(function (res, rej) {
            user.getMFAOptions(function (err, mfaOptions) {
                if (err) {
                    logger.debug('get MFA Options failed', err);
                    rej(err);
                }
                logger.debug('get MFA options success', mfaOptions);
                res(mfaOptions);
            });
        });
    };
    /**
     * set preferred MFA method
     * @param {CognitoUser} user - the current Cognito user
     * @param {string} mfaMethod - preferred mfa method
     * @return - A promise resolve if success
     */
    AuthClass.prototype.setPreferredMFA = function (user, mfaMethod) {
        var smsMfaSettings = null;
        var totpMfaSettings = {
            PreferredMfa: false,
            Enabled: false
        };
        switch (mfaMethod) {
            case 'TOTP':
                totpMfaSettings = {
                    PreferredMfa: true,
                    Enabled: true
                };
                break;
            case 'SMS':
                smsMfaSettings = {
                    PreferredMfa: true,
                    Enabled: true
                };
                break;
            case 'NOMFA':
                break;
            default:
                logger.debug('no validmfa method provided');
                return Promise.reject('no validmfa method provided');
        }
        var that = this;
        var TOTP_NOT_VERIFED = 'User has not verified software token mfa';
        var TOTP_NOT_SETUP = 'User has not set up software token mfa';
        return new Promise(function (res, rej) {
            user.setUserMfaPreference(smsMfaSettings, totpMfaSettings, function (err, result) {
                if (err) {
                    // if totp not setup or verified and user want to set it, return error
                    // otherwise igonre it
                    if (err.message === TOTP_NOT_SETUP || err.message === TOTP_NOT_VERIFED) {
                        if (mfaMethod === 'SMS') {
                            that.enableSMS(user).then(function (data) {
                                logger.debug('Set user mfa success', data);
                                res(data);
                            }).catch(function (err) {
                                logger.debug('Set user mfa preference error', err);
                                rej(err);
                            });
                        }
                        else if (mfaMethod === 'NOMFA') {
                            // diable sms
                            that.disableSMS(user).then(function (data) {
                                logger.debug('Set user mfa success', data);
                                res(data);
                            }).catch(function (err) {
                                logger.debug('Set user mfa preference error', err);
                                rej(err);
                            });
                        }
                        else {
                            logger.debug('Set user mfa preference error', err);
                            rej(err);
                        }
                    }
                    else {
                        logger.debug('Set user mfa preference error', err);
                        rej(err);
                    }
                }
                logger.debug('Set user mfa success', result);
                res(result);
            });
        });
    };
    /**
     * diable SMS
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    AuthClass.prototype.disableSMS = function (user) {
        return new Promise(function (res, rej) {
            user.disableMFA(function (err, data) {
                if (err) {
                    logger.debug('disable mfa failed', err);
                    rej(err);
                }
                logger.debug('disable mfa succeed', data);
                res(data);
            });
        });
    };
    /**
     * enable SMS
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    AuthClass.prototype.enableSMS = function (user) {
        return new Promise(function (res, rej) {
            user.enableMFA(function (err, data) {
                if (err) {
                    logger.debug('enable mfa failed', err);
                    rej(err);
                }
                logger.debug('enable mfa succeed', data);
                res(data);
            });
        });
    };
    /**
     * Setup TOTP
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves with the secret code if success
     */
    AuthClass.prototype.setupTOTP = function (user) {
        return new Promise(function (res, rej) {
            user.associateSoftwareToken({
                onFailure: function (err) {
                    logger.debug('associateSoftwareToken failed', err);
                    rej(err);
                },
                associateSecretCode: function (secretCode) {
                    logger.debug('associateSoftwareToken sucess', secretCode);
                    res(secretCode);
                }
            });
        });
    };
    /**
     * verify TOTP setup
     * @param {CognitoUser} user - the current user
     * @param {string} challengeAnswer - challenge answer
     * @return - A promise resolves is success
     */
    AuthClass.prototype.verifyTotpToken = function (user, challengeAnswer) {
        logger.debug('verfication totp token', user, challengeAnswer);
        return new Promise(function (res, rej) {
            user.verifySoftwareToken(challengeAnswer, 'My TOTP device', {
                onFailure: function (err) {
                    logger.debug('verifyTotpToken failed', err);
                    rej(err);
                },
                onSuccess: function (data) {
                    logger.debug('verifyTotpToken success', data);
                    res(data);
                }
            });
        });
    };
    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    AuthClass.prototype.confirmSignIn = function (user, code, mfaType) {
        var _this = this;
        if (!code) {
            return Promise.reject('Code cannot be empty');
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.sendMFACode(code, {
                onSuccess: function (session) { return __awaiter(_this, void 0, void 0, function () {
                    var cred, e_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logger.debug(session);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, 4, 5]);
                                return [4 /*yield*/, Common_1.Credentials.set(session, 'session')];
                            case 2:
                                cred = _a.sent();
                                logger.debug('succeed to get cognito credentials', cred);
                                return [3 /*break*/, 5];
                            case 3:
                                e_3 = _a.sent();
                                logger.debug('cannot get cognito credentials', e_3);
                                return [3 /*break*/, 5];
                            case 4:
                                that.user = user;
                                dispatchAuthEvent('signIn', user);
                                resolve(user);
                                return [7 /*endfinally*/];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); },
                onFailure: function (err) {
                    logger.debug('confirm signIn failure', err);
                    reject(err);
                }
            }, mfaType);
        });
    };
    AuthClass.prototype.completeNewPassword = function (user, password, requiredAttributes) {
        var _this = this;
        if (!password) {
            return Promise.reject('Password cannot be empty');
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.completeNewPasswordChallenge(password, requiredAttributes, {
                onSuccess: function (session) { return __awaiter(_this, void 0, void 0, function () {
                    var cred, e_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logger.debug(session);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, 4, 5]);
                                return [4 /*yield*/, Common_1.Credentials.set(session, 'session')];
                            case 2:
                                cred = _a.sent();
                                logger.debug('succeed to get cognito credentials', cred);
                                return [3 /*break*/, 5];
                            case 3:
                                e_4 = _a.sent();
                                logger.debug('cannot get cognito credentials', e_4);
                                return [3 /*break*/, 5];
                            case 4:
                                that.user = user;
                                dispatchAuthEvent('signIn', user);
                                resolve(user);
                                return [7 /*endfinally*/];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); },
                onFailure: function (err) {
                    logger.debug('completeNewPassword failure', err);
                    dispatchAuthEvent('completeNewPassword_failure', err);
                    reject(err);
                },
                mfaRequired: function (challengeName, challengeParam) {
                    logger.debug('signIn MFA required');
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                },
                mfaSetup: function (challengeName, challengeParam) {
                    logger.debug('signIn mfa setup', challengeName);
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                }
            });
        });
    };
    /**
     * Send the answer to a custom challenge
     * @param {CognitoUser} user - The CognitoUser object
     * @param {String} challengeResponses - The confirmation code
     */
    AuthClass.prototype.sendCustomChallengeAnswer = function (user, challengeResponses) {
        var _this = this;
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!challengeResponses) {
            return Promise.reject('Challenge response cannot be empty');
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.sendCustomChallengeAnswer(challengeResponses, _this.authCallbacks(user, resolve, reject));
        });
    };
    /**
     * Update an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise}
     **/
    AuthClass.prototype.updateUserAttributes = function (user, attributes) {
        var attr = {};
        var attributeList = [];
        return this.userSession(user)
            .then(function (session) {
            return new Promise(function (resolve, reject) {
                for (var key in attributes) {
                    if (key !== 'sub' &&
                        key.indexOf('_verified') < 0) {
                        attr = {
                            'Name': key,
                            'Value': attributes[key]
                        };
                        attributeList.push(attr);
                    }
                }
                user.updateAttributes(attributeList, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    };
    /**
     * Return user attributes
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to user attributes if success
     */
    AuthClass.prototype.userAttributes = function (user) {
        return this.userSession(user)
            .then(function (session) {
            return new Promise(function (resolve, reject) {
                user.getUserAttributes(function (err, attributes) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(attributes);
                    }
                });
            });
        });
    };
    AuthClass.prototype.verifiedContact = function (user) {
        var that = this;
        return this.userAttributes(user)
            .then(function (attributes) {
            var attrs = that.attributesToObject(attributes);
            var unverified = {};
            var verified = {};
            if (attrs['email']) {
                if (attrs['email_verified']) {
                    verified['email'] = attrs['email'];
                }
                else {
                    unverified['email'] = attrs['email'];
                }
            }
            if (attrs['phone_number']) {
                if (attrs['phone_number_verified']) {
                    verified['phone_number'] = attrs['phone_number'];
                }
                else {
                    unverified['phone_number'] = attrs['phone_number'];
                }
            }
            return {
                verified: verified,
                unverified: unverified
            };
        });
    };
    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    AuthClass.prototype.currentUserPoolUser = function () {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        var user = null;
        if (Platform_1.default.isReactNative) {
            var that = this;
            return this.getSyncedUser().then(function (user) {
                if (!user) {
                    return Promise.reject('No current user in userPool');
                }
                return new Promise(function (resolve, reject) {
                    user.getSession(function (err, session) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(user);
                        }
                    });
                });
            });
        }
        else {
            user = this.userPool.getCurrentUser();
            if (!user) {
                return Promise.reject('No current user in userPool');
            }
            return new Promise(function (resolve, reject) {
                user.getSession(function (err, session) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(user);
                    }
                });
            });
        }
    };
    /**
     * Return the current user after synchornizing AsyncStorage
     * @return - A promise with the current authenticated user
     **/
    AuthClass.prototype.getSyncedUser = function () {
        var that = this;
        return (this._userPoolStorageSync || Promise.resolve()).then(function (result) {
            if (!that.userPool) {
                return Promise.reject('No userPool');
            }
            return that.userPool.getCurrentUser();
        });
    };
    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    AuthClass.prototype.currentAuthenticatedUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var federatedUser, e_5, user, e_6, attributes, _a, e_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger.debug('getting current authenticted user');
                        federatedUser = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Cache_1.default.getItem('federatedInfo').user];
                    case 2:
                        federatedUser = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _b.sent();
                        logger.debug('cannot load federated user from cache');
                        return [3 /*break*/, 4];
                    case 4:
                        if (!federatedUser) return [3 /*break*/, 5];
                        this.user = federatedUser;
                        logger.debug('get current authenticated federated user', this.user);
                        return [2 /*return*/, this.user];
                    case 5:
                        logger.debug('get current authenticated userpool user');
                        user = null;
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.currentUserPoolUser()];
                    case 7:
                        user = _b.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_6 = _b.sent();
                        throw 'not authenticated';
                    case 9:
                        attributes = {};
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, 12, 13, 14]);
                        _a = this.attributesToObject;
                        return [4 /*yield*/, this.userAttributes(user)];
                    case 11:
                        attributes = _a.apply(this, [_b.sent()]);
                        return [3 /*break*/, 14];
                    case 12:
                        e_7 = _b.sent();
                        logger.debug('cannot get user attributes');
                        return [3 /*break*/, 14];
                    case 13:
                        this.user = Object.assign(user, { attributes: attributes });
                        return [2 /*return*/, this.user];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current user's session
     * @return - A promise resolves to session object if success
     */
    AuthClass.prototype.currentSession = function () {
        var user;
        var that = this;
        logger.debug('Getting current session');
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (Platform_1.default.isReactNative) {
            return this.getSyncedUser().then(function (user) {
                if (!user) {
                    logger.debug('Failed to get user from user pool');
                    return Promise.reject('No current user');
                }
                return that.userSession(user);
            });
        }
        else {
            user = this.userPool.getCurrentUser();
            if (!user) {
                logger.debug('Failed to get user from user pool');
                return Promise.reject('No current user');
            }
            return this.userSession(user);
        }
    };
    /**
     * Get the corresponding user session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    AuthClass.prototype.userSession = function (user) {
        return new Promise(function (resolve, reject) {
            logger.debug('Getting the session from this user:', user);
            user.getSession(function (err, session) {
                if (err) {
                    logger.debug('Failed to get the session from user', user);
                    reject(err);
                }
                else {
                    logger.debug('Succeed to get the user session', session);
                    // check if session is expired
                    if (!session.isValid()) {
                        var refreshToken = session.getRefreshToken();
                        logger.debug('Session is not valid, refreshing session with refreshToken', refreshToken);
                        user.refreshSession(refreshToken, function (err, newSession) {
                            if (err) {
                                logger.debug('Refresh Cognito Session failed', err);
                                reject(err);
                            }
                            logger.debug('Refresh Cognito Session success', newSession);
                            resolve(newSession);
                        });
                    }
                    else {
                        logger.debug('Session is valid, directly return this session');
                        resolve(session);
                    }
                }
            });
        });
    };
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    AuthClass.prototype.currentUserCredentials = function () {
        var that = this;
        logger.debug('Getting current user credentials');
        if (Platform_1.default.isReactNative) {
            // asyncstorage
            return Cache_1.default.getItem('federatedInfo')
                .then(function (federatedInfo) {
                if (federatedInfo) {
                    // refresh the jwt token here if necessary
                    return Common_1.Credentials.refreshFederatedToken(federatedInfo);
                }
                else {
                    return that.currentSession()
                        .then(function (session) {
                        return Common_1.Credentials.set(session, 'session');
                    }).catch(function (error) {
                        return Common_1.Credentials.set(null, 'guest');
                    });
                }
            }).catch(function (error) {
                return Promise.reject(error);
            });
        }
        else {
            // first to check whether there is federation info in the local storage
            var federatedInfo = Cache_1.default.getItem('federatedInfo');
            if (federatedInfo) {
                // refresh the jwt token here if necessary
                return Common_1.Credentials.refreshFederatedToken(federatedInfo);
            }
            else {
                return this.currentSession()
                    .then(function (session) {
                    logger.debug('getting session success', session);
                    return Common_1.Credentials.set(session, 'session');
                }).catch(function (error) {
                    logger.debug('getting session failed', error);
                    return Common_1.Credentials.set(null, 'guest');
                });
            }
        }
    };
    AuthClass.prototype.currentCredentials = function () {
        logger.debug('getting current credntials');
        return Common_1.Credentials.get();
    };
    /**
     * Initiate an attribute confirmation request
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attributes to be verified
     * @return - A promise resolves to callback data if success
     */
    AuthClass.prototype.verifyUserAttribute = function (user, attr) {
        return new Promise(function (resolve, reject) {
            user.getAttributeVerificationCode(attr, {
                onSuccess: function (data) { resolve(data); },
                onFailure: function (err) { reject(err); }
            });
        });
    };
    /**
     * Confirm an attribute using a confirmation code
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    AuthClass.prototype.verifyUserAttributeSubmit = function (user, attr, code) {
        if (!code) {
            return Promise.reject('Code cannot be empty');
        }
        return new Promise(function (resolve, reject) {
            user.verifyAttribute(attr, code, {
                onSuccess: function (data) { resolve(data); },
                onFailure: function (err) { reject(err); }
            });
        });
    };
    AuthClass.prototype.verifyCurrentUserAttribute = function (attr) {
        var that = this;
        return that.currentUserPoolUser()
            .then(function (user) { return that.verifyUserAttribute(user, attr); });
    };
    /**
     * Confirm current user's attribute using a confirmation code
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    AuthClass.prototype.verifyCurrentUserAttributeSubmit = function (attr, code) {
        var that = this;
        return that.currentUserPoolUser()
            .then(function (user) { return that.verifyUserAttributeSubmit(user, attr, code); });
    };
    /**
     * Sign out method
     * @return - A promise resolved if success
     */
    AuthClass.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var e_8, user, that;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cleanCachedItems()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        logger.debug('failed to clear cached items');
                        return [3 /*break*/, 3];
                    case 3:
                        if (this.userPool) {
                            user = this.userPool.getCurrentUser();
                            if (user) {
                                logger.debug('user sign out', user);
                                user.signOut();
                                if (this._cognitoAuthClient) {
                                    this._cognitoAuthClient.signOut();
                                }
                            }
                        }
                        else {
                            logger.debug('no Congito User pool');
                        }
                        that = this;
                        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var e_9;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, 3, 4]);
                                            return [4 /*yield*/, Common_1.Credentials.set(null, 'guest')];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2:
                                            e_9 = _a.sent();
                                            logger.debug('cannot load guest credentials for unauthenticated user', e_9);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            dispatchAuthEvent('signOut', that.user);
                                            that.user = null;
                                            resolve();
                                            return [7 /*endfinally*/];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    AuthClass.prototype.cleanCachedItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // clear cognito cached item
                    return [4 /*yield*/, Common_1.Credentials.clear()];
                    case 1:
                        // clear cognito cached item
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Change a password for an authenticated user
     * @param {Object} user - The CognitoUser object
     * @param {String} oldPassword - the current password
     * @param {String} newPassword - the requested new password
     * @return - A promise resolves if success
     */
    AuthClass.prototype.changePassword = function (user, oldPassword, newPassword) {
        return this.userSession(user)
            .then(function (session) {
            return new Promise(function (resolve, reject) {
                user.changePassword(oldPassword, newPassword, function (err, data) {
                    if (err) {
                        logger.debug('change password failure', err);
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    };
    /**
     * Initiate a forgot password request
     * @param {String} username - the username to change password
     * @return - A promise resolves if success
     */
    AuthClass.prototype.forgotPassword = function (username) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        var user = this.createCognitoUser(username);
        return new Promise(function (resolve, reject) {
            user.forgotPassword({
                onSuccess: function () { resolve(); },
                onFailure: function (err) {
                    logger.debug('forgot password failure', err);
                    reject(err);
                },
                inputVerificationCode: function (data) {
                    resolve(data);
                }
            });
        });
    };
    /**
     * Confirm a new password using a confirmation Code
     * @param {String} username - The username
     * @param {String} code - The confirmation code
     * @param {String} password - The new password
     * @return - A promise that resolves if success
     */
    AuthClass.prototype.forgotPasswordSubmit = function (username, code, password) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (!code) {
            return Promise.reject('Code cannot be empty');
        }
        if (!password) {
            return Promise.reject('Password cannot be empty');
        }
        var user = this.createCognitoUser(username);
        return new Promise(function (resolve, reject) {
            user.confirmPassword(code, password, {
                onSuccess: function () { resolve(); },
                onFailure: function (err) { reject(err); }
            });
        });
    };
    /**
     * Get user information
     * @async
     * @return {Object }- current User's information
     */
    AuthClass.prototype.currentUserInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var source, user, attributes, userAttrs, credentials, e_10, info, err_1, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        source = Common_1.Credentials.getCredSource();
                        if (!(!source || source === 'aws' || source === 'userPool')) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.currentUserPoolUser()
                                .catch(function (err) { return logger.debug(err); })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this.userAttributes(user)];
                    case 3:
                        attributes = _a.sent();
                        userAttrs = this.attributesToObject(attributes);
                        credentials = null;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.currentCredentials()];
                    case 5:
                        credentials = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_10 = _a.sent();
                        logger.debug('Failed to retrieve credentials while getting current user info', e_10);
                        return [3 /*break*/, 7];
                    case 7:
                        info = {
                            'id': credentials ? credentials.identityId : undefined,
                            'username': user.username,
                            'attributes': userAttrs
                        };
                        return [2 /*return*/, info];
                    case 8:
                        err_1 = _a.sent();
                        logger.debug('currentUserInfo error', err_1);
                        return [2 /*return*/, {}];
                    case 9:
                        if (source === 'federated') {
                            user = this.user;
                            return [2 /*return*/, user ? user : {}];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * For federated login
     * @param {String} provider - federation login provider
     * @param {FederatedResponse} response - response should have the access token
     * the identity id (optional)
     * and the expiration time (the universal time)
     * @param {String} user - user info
     */
    AuthClass.prototype.federatedSignIn = function (provider, response, user) {
        var token = response.token, identity_id = response.identity_id, expires_at = response.expires_at;
        var that = this;
        return new Promise(function (res, rej) {
            Common_1.Credentials.set({ provider: provider, token: token, identity_id: identity_id, user: user, expires_at: expires_at }, 'federation').then(function (cred) {
                dispatchAuthEvent('signIn', that.user);
                logger.debug('federated sign in credentials', cred);
                res(cred);
            }).catch(function (e) {
                rej(e);
            });
        });
    };
    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    AuthClass.prototype.essentialCredentials = function (credentials) {
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        };
    };
    AuthClass.prototype.attributesToObject = function (attributes) {
        var obj = {};
        if (attributes) {
            attributes.map(function (attribute) {
                if (attribute.Name === 'sub')
                    return;
                if (attribute.Value === 'true') {
                    obj[attribute.Name] = true;
                }
                else if (attribute.Value === 'false') {
                    obj[attribute.Name] = false;
                }
                else {
                    obj[attribute.Name] = attribute.Value;
                }
            });
        }
        return obj;
    };
    AuthClass.prototype.createCognitoUser = function (username) {
        var userData = {
            Username: username,
            Pool: this.userPool,
        };
        var cookieStorage = this._config.cookieStorage;
        if (cookieStorage) {
            userData.Storage = new CookieStorage(cookieStorage);
        }
        return new CognitoUser(userData);
    };
    return AuthClass;
}());
exports.default = AuthClass;
//# sourceMappingURL=Auth.js.map