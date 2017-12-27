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
var Cache_1 = require("../Cache");
var logger = new Common_1.ConsoleLogger('AuthClass');
var CognitoIdentityCredentials = Common_1.AWS.CognitoIdentityCredentials;
var CognitoUserPool = Common_1.Cognito.CognitoUserPool, CognitoUserAttribute = Common_1.Cognito.CognitoUserAttribute, CognitoUser = Common_1.Cognito.CognitoUser, AuthenticationDetails = Common_1.Cognito.AuthenticationDetails;
var dispatchAuthEvent = function (event, data) {
    Common_1.Hub.dispatch('auth', { event: event, data: data }, 'Auth');
};
/**
* Provide authentication steps
*/
var AuthClass = (function () {
    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    function AuthClass(config) {
        this.userPool = null;
        this.credentials = null;
        this.credentials_source = ''; // aws, guest, userPool, federated
        this.user = null;
        this.configure(config);
        if (Common_1.AWS.config) {
            Common_1.AWS.config.update({ customUserAgent: Common_1.Constants.userAgent });
        }
        else {
            logger.warn('No AWS.config');
        }
    }
    AuthClass.prototype.configure = function (config) {
        logger.debug('configure Auth');
        var conf = config ? config.Auth || config : {};
        if (conf['aws_cognito_identity_pool_id']) {
            conf = {
                userPoolId: conf['aws_user_pools_id'],
                userPoolWebClientId: conf['aws_user_pools_web_client_id'],
                region: conf['aws_cognito_region'],
                identityPoolId: conf['aws_cognito_identity_pool_id']
            };
        }
        this._config = Object.assign({}, this._config, conf);
        if (!this._config.identityPoolId) {
            logger.debug('Do not have identityPoolId yet.');
        }
        var _a = this._config, userPoolId = _a.userPoolId, userPoolWebClientId = _a.userPoolWebClientId;
        if (userPoolId) {
            this.userPool = new CognitoUserPool({
                UserPoolId: userPoolId,
                ClientId: userPoolWebClientId
            });
            this.pickupCredentials();
        }
        return this._config;
    };
    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String} username - The username to be signed up
     * @param {String} password - The password of the user
     * @param {Object} attributeList - Other attributes
     * @return - A promise resolves callback data if success
     */
    AuthClass.prototype.signUp = function (username, password, email, phone_number) {
        var _this = this;
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (!password) {
            return Promise.reject('Password cannot be empty');
        }
        var attributes = [];
        if (email) {
            attributes.push({ Name: 'email', Value: email });
        }
        if (phone_number) {
            attributes.push({ Name: 'phone_number', Value: phone_number });
        }
        return new Promise(function (resolve, reject) {
            _this.userPool.signUp(username, password, attributes, null, function (err, data) {
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
     * @return - A promise resolves callback data if success
     */
    AuthClass.prototype.confirmSignUp = function (username, code) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (!code) {
            return Promise.reject('Code cannot be empty');
        }
        var user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise(function (resolve, reject) {
            user.confirmRegistration(code, true, function (err, data) {
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
        var user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
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
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    AuthClass.prototype.signIn = function (username, password) {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        if (!username) {
            return Promise.reject('Username cannot be empty');
        }
        if (!password) {
            return Promise.reject('Password cannot be empty');
        }
        var user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        var authDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });
        var that = this;
        return new Promise(function (resolve, reject) {
            user.authenticateUser(authDetails, {
                onSuccess: function (session) {
                    logger.debug(session);
                    that.setCredentialsFromSession(session);
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                },
                onFailure: function (err) {
                    logger.debug('signIn failure', err);
                    dispatchAuthEvent('signIn_failure', err);
                    reject(err);
                },
                mfaRequired: function (challengeName, challengeParam) {
                    logger.debug('signIn MFA required');
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
                }
            });
        });
    };
    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    AuthClass.prototype.confirmSignIn = function (user, code) {
        if (!code) {
            return Promise.reject('Code cannot be empty');
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.sendMFACode(code, {
                onSuccess: function (session) {
                    logger.debug(session);
                    that.setCredentialsFromSession(session);
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                },
                onFailure: function (err) {
                    logger.debug('confirm signIn failure', err);
                    reject(err);
                }
            });
        });
    };
    AuthClass.prototype.completeNewPassword = function (user, password, requiredAttributes) {
        if (!password) {
            return Promise.reject('Password cannot be empty');
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.completeNewPasswordChallenge(password, requiredAttributes, {
                onSuccess: function (session) {
                    logger.debug(session);
                    that.setCredentialsFromSession(session);
                    that.user = user;
                    dispatchAuthEvent('signIn', user);
                    resolve(user);
                },
                onFailure: function (err) {
                    logger.debug('completeNewPassword failure', err);
                    reject(err);
                },
                mfaRequired: function (challengeName, challengeParam) {
                    logger.debug('signIn MFA required');
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                }
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
        var user = this.userPool.getCurrentUser();
        if (!user) {
            return Promise.reject('No current user in userPool');
        }
        logger.debug(user);
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
    };
    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    AuthClass.prototype.currentAuthenticatedUser = function () {
        var source = this.credentials_source;
        logger.debug('get current authenticated user. source ' + source);
        if (!source || source === 'aws' || source === 'userPool') {
            return this.currentUserPoolUser();
        }
        if (source === 'federated') {
            return Promise.resolve(this.user);
        }
        return Promise.reject('not authenticated');
    };
    /**
     * Get current user's session
     * @return - A promise resolves to session object if success
     */
    AuthClass.prototype.currentSession = function () {
        if (!this.userPool) {
            return Promise.reject('No userPool');
        }
        var user = this.userPool.getCurrentUser();
        if (!user) {
            return Promise.reject('No current user');
        }
        return this.userSession(user);
    };
    /**
     * Get the corresponding user session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    AuthClass.prototype.userSession = function (user) {
        return new Promise(function (resolve, reject) {
            logger.debug(user);
            user.getSession(function (err, session) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(session);
                }
            });
        });
    };
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    AuthClass.prototype.currentUserCredentials = function () {
        var _this = this;
        // first to check whether there is federation info in the local storage
        var federatedInfo = Cache_1.default.getItem('federatedInfo');
        if (federatedInfo) {
            var provider_1 = federatedInfo.provider, token_1 = federatedInfo.token, user_1 = federatedInfo.user;
            return new Promise(function (resolve, reject) {
                _this.setCredentialsFromFederation(provider_1, token_1, user_1);
                resolve();
            });
        }
        else {
            return this.currentSession()
                .then(function (session) { return _this.setCredentialsFromSession(session); });
        }
    };
    AuthClass.prototype.currentCredentials = function () {
        return this.pickupCredentials();
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
        var _this = this;
        var source = this.credentials_source;
        // clean out the cached stuff
        this.credentials.clearCachedId();
        // clear federatedInfo
        Cache_1.default.removeItem('federatedInfo');
        if (source === 'aws' || source === 'userPool') {
            if (!this.userPool) {
                return Promise.reject('No userPool');
            }
            var user = this.userPool.getCurrentUser();
            if (!user) {
                return Promise.resolve();
            }
            user.signOut();
        }
        return new Promise(function (resolve, reject) {
            _this.setCredentialsForGuest();
            dispatchAuthEvent('signOut', _this.user);
            _this.user = null;
            resolve();
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
        var user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
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
        var user = new CognitoUser({
            Username: username,
            Pool: this.userPool
        });
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
            var credentials, source, user, attributes, info, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentials = this.credentials;
                        source = this.credentials_source;
                        if (!source) {
                            return [2 /*return*/, null];
                        }
                        if (!(source === 'aws' || source === 'userPool')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.currentUserPoolUser()
                                .catch(function (err) { return logger.debug(err); })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.userAttributes(user)
                                .catch(function (err) {
                                logger.debug('currentUserInfo error', err);
                                return {};
                            })];
                    case 2:
                        attributes = _a.sent();
                        info = {
                            username: user.username,
                            id: credentials.identityId,
                            email: attributes.email,
                            phone_number: attributes.phone_number
                        };
                        return [2 /*return*/, info];
                    case 3:
                        if (source === 'federated') {
                            user = this.user;
                            return [2 /*return*/, user ? user : {}];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthClass.prototype.federatedSignIn = function (provider, response, user) {
        var token = response.token, expires_at = response.expires_at;
        this.setCredentialsFromFederation(provider, token, user);
        // store it into localstorage
        Cache_1.default.setItem('federatedInfo', { provider: provider, token: token, user: user }, { priority: 1 });
        dispatchAuthEvent('signIn', this.user);
        logger.debug('federated sign in credentials', this.credentials);
        return this.keepAlive();
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
        attributes.map(function (attribute) {
            obj[attribute.Name] = (attribute.Value === 'false') ? false : attribute.Value;
        });
        return obj;
    };
    AuthClass.prototype.setCredentialsFromFederation = function (provider, token, user) {
        var domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com',
            'amazon': 'www.amazon.com'
        };
        var domain = domains[provider];
        if (!domain) {
            return Promise.reject(provider + ' is not supported: [google, facebook, amazon]');
        }
        var logins = {};
        logins[domain] = token;
        var _a = this._config, identityPoolId = _a.identityPoolId, region = _a.region;
        this.credentials = new Common_1.AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
            Logins: logins
        }, {
            region: region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'federated';
        this.user = Object.assign({ id: this.credentials.identityId }, user);
        if (Common_1.AWS && Common_1.AWS.config) {
            Common_1.AWS.config.credentials = this.credentials;
        }
    };
    AuthClass.prototype.pickupCredentials = function () {
        var _this = this;
        if (this.credentials) {
            return this.keepAlive();
        }
        else if (this.setCredentialsFromAWS()) {
            return this.keepAlive();
        }
        else {
            logger.debug('pickup from userPool');
            return this.currentUserCredentials()
                .then(function () { return _this.keepAlive(); })
                .catch(function (err) {
                logger.debug('error when pickup', err);
                _this.setCredentialsForGuest();
                return _this.keepAlive();
            });
        }
    };
    AuthClass.prototype.setCredentialsFromAWS = function () {
        if (Common_1.AWS.config && Common_1.AWS.config.credentials) {
            this.credentials = Common_1.AWS.config.credentials;
            this.credentials_source = 'aws';
            return true;
        }
        return false;
    };
    AuthClass.prototype.setCredentialsForGuest = function () {
        var _a = this._config, identityPoolId = _a.identityPoolId, region = _a.region;
        var credentials = new CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId
        }, {
            region: region
        });
        credentials.params['IdentityId'] = null; // Cognito load IdentityId from local cache
        this.credentials = credentials;
        this.credentials.authenticated = false;
        this.credentials_source = 'guest';
    };
    AuthClass.prototype.setCredentialsFromSession = function (session) {
        logger.debug('set credentials from session');
        var idToken = session.getIdToken().getJwtToken();
        var _a = this._config, region = _a.region, userPoolId = _a.userPoolId, identityPoolId = _a.identityPoolId;
        var key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        var logins = {};
        logins[key] = idToken;
        this.credentials = new CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
            Logins: logins
        }, {
            region: region
        });
        this.credentials.authenticated = true;
        this.credentials_source = 'userPool';
    };
    AuthClass.prototype.keepAlive = function () {
        if (!this.credentials) {
            this.setCredentialsForGuest();
        }
        var ts = new Date().getTime();
        var delta = 10 * 60 * 1000; // 10 minutes
        var credentials = this.credentials;
        var expired = credentials.expired, expireTime = credentials.expireTime;
        if (!expired && expireTime > ts + delta) {
            return Promise.resolve(credentials);
        }
        return new Promise(function (resolve, reject) {
            credentials.refresh(function (err) {
                if (err) {
                    logger.debug('refresh credentials error', err);
                    resolve(null);
                }
                else {
                    resolve(credentials);
                }
            });
        });
    };
    return AuthClass;
}());
exports.default = AuthClass;
//# sourceMappingURL=Auth.js.map