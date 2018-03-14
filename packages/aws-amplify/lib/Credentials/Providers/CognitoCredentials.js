"use strict";
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
var Common_1 = require("../../Common");
var Cache_1 = require("../../Cache");
var CognitoIdentityCredentials = Common_1.AWS.CognitoIdentityCredentials;
var logger = new Common_1.ConsoleLogger('CognitoCredentials');
var CognitoCredentials = /** @class */ (function () {
    function CognitoCredentials(config) {
        this.credentials_source = ''; // aws, guest, userPool, federated
        this.gettingCred = false;
        this._config = config ? config : {};
        this._credentials = null;
    }
    /**
     * pass the configuration
     * @param config
     */
    CognitoCredentials.prototype.configure = function (config) {
        logger.debug('configure CognitoCredentials with config', config);
        var conf = config ? config : {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    };
    /**
     * Get the category of this provider
     */
    CognitoCredentials.prototype.getCategory = function () {
        return 'Credentials';
    };
    /**
     * Get the name of this provider
     */
    CognitoCredentials.prototype.getProviderName = function () {
        return 'AWSCognito';
    };
    /**
     * Set the credentials with configuration
     * @param config - the configuration to set the credentials
     */
    CognitoCredentials.prototype.setCredentials = function (config) {
        var session = config.session, guest = config.guest, federated = config.federated;
        if (session) {
            this._currentSessionHandler = config.currentSessionHandler;
            return this._setCredentialsFromSession(session);
        }
        else if (guest) {
            return this._setCredentialsForGuest();
        }
        else if (federated) {
            return this._setCredentialsFromFederation(federated);
        }
        else {
            logger.debug('incorrect configuration for credentials', config);
            return Promise.reject('incorrect configuration for credentials');
        }
    };
    /**
     * Remove the credential from library
     */
    CognitoCredentials.prototype.removeCredentials = function () {
        if (this._credentials)
            this._credentials.clearCachedId();
        Cache_1.default.removeItem('federatedInfo');
        this._credentials = null;
        this.credentials_source = '';
    };
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    CognitoCredentials.prototype.getCredentials = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var cred;
            return __generator(this, function (_a) {
                logger.debug('getting credentials with config', config);
                cred = this._credentials || Common_1.AWS.config.credentials;
                if (cred && !this._isExpired(cred)) {
                    logger.debug('credentails exists and not expired');
                    return [2 /*return*/, Promise.resolve(cred)];
                }
                else {
                    return [2 /*return*/, this._retrieveCredentialsFromAuth()];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    CognitoCredentials.prototype.essentialCredentials = function (params) {
        logger.debug('essential credentials');
        var credentials = params.credentials;
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated
        };
    };
    CognitoCredentials.prototype._retrieveCredentialsFromAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var federatedInfo, provider, token, user, that_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger.debug('getting credentials from cognito auth');
                        return [4 /*yield*/, Cache_1.default.getItem('federatedInfo')];
                    case 1:
                        federatedInfo = _a.sent();
                        if (federatedInfo) {
                            provider = federatedInfo.provider, token = federatedInfo.token, user = federatedInfo.user;
                            return [2 /*return*/, this._setCredentialsFromFederation({ provider: provider, token: token, user: user })];
                        }
                        else {
                            that_1 = this;
                            if (this._currentSessionHandler && typeof this._currentSessionHandler === 'function') {
                                return [2 /*return*/, this._currentSessionHandler()
                                        .then(function (session) { return that_1._setCredentialsFromSession(session); })
                                        .catch(function (error) { return that_1._setCredentialsForGuest(); })];
                            }
                            else {
                                return [2 /*return*/, this._setCredentialsForGuest()];
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(e_1)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CognitoCredentials.prototype._isExpired = function (credentials) {
        if (!credentials) {
            logger.debug('no credentials for expiration check');
            return true;
        }
        logger.debug('is this credentials expired?', credentials);
        var ts = new Date().getTime();
        var delta = 10 * 60 * 1000; // 10 minutes
        var expired = credentials.expired, expireTime = credentials.expireTime;
        if (!expired && expireTime > ts + delta) {
            return false;
        }
        return true;
    };
    CognitoCredentials.prototype._refreshCredentials = function (credentials) {
        logger.debug('try to refresh credentials', credentials);
        var cred = credentials || this._credentials;
        if (!cred) {
            return Promise.reject(new Error('no credentials provided for refreshing!'));
        }
        return new Promise(function (resolve, reject) {
            cred.refresh(function (err) {
                if (err) {
                    logger.debug('refresh credentials error', err);
                    resolve(null);
                }
                else {
                    resolve(cred);
                }
            });
        });
    };
    CognitoCredentials.prototype._setCredentialsForGuest = function () {
        var _this = this;
        logger.debug('set credentials from guest with config', this._config);
        var _a = this._config, cognitoIdentityPoolId = _a.cognitoIdentityPoolId, cognitoRegion = _a.cognitoRegion, mandatorySignIn = _a.mandatorySignIn;
        if (mandatorySignIn) {
            logger.debug('mandatory sign in, no guest credentials provided');
            this._credentials = null;
            this.credentials_source = 'no credentials';
            return;
        }
        var credentials = new CognitoIdentityCredentials({
            IdentityPoolId: cognitoIdentityPoolId
        }, {
            region: cognitoRegion
        });
        var that = this;
        return new Promise(function (res, rej) {
            credentials.getPromise().then(function () {
                logger.debug('Load creadentials for guest successfully', credentials);
                that._credentials = credentials;
                that._credentials.authenticated = false;
                that.credentials_source = 'guest';
                if (Common_1.AWS && Common_1.AWS.config) {
                    Common_1.AWS.config.credentials = that._credentials;
                }
                _this.gettingCred = false;
                res(that._credentials);
            }, function (err) {
                logger.debug('Failed to load creadentials for guest', credentials);
                _this.gettingCred = false;
                rej('Failed to load creadentials for guest');
            });
        });
    };
    CognitoCredentials.prototype._setCredentialsFromSession = function (session) {
        var _this = this;
        logger.debug('set credentials from session');
        var idToken = session.getIdToken().getJwtToken();
        var _a = this._config, cognitoRegion = _a.cognitoRegion, cognitoUserPoolId = _a.cognitoUserPoolId, cognitoIdentityPoolId = _a.cognitoIdentityPoolId;
        var key = 'cognito-idp.' + cognitoRegion + '.amazonaws.com/' + cognitoUserPoolId;
        var logins = {};
        logins[key] = idToken;
        var credentials = new CognitoIdentityCredentials({
            IdentityPoolId: cognitoIdentityPoolId,
            Logins: logins
        }, {
            region: cognitoRegion
        });
        var that = this;
        return new Promise(function (res, rej) {
            credentials.getPromise().then(function () {
                logger.debug('Load creadentials for userpool user successfully', credentials);
                that._credentials = credentials;
                that._credentials.authenticated = true;
                that.credentials_source = 'userpool';
                if (Common_1.AWS && Common_1.AWS.config) {
                    Common_1.AWS.config.credentials = that._credentials;
                }
                _this.gettingCred = false;
                res(that._credentials);
            }, function (err) {
                logger.debug('Failed to load creadentials for userpoool user', credentials);
                _this.gettingCred = false;
                rej('Failed to load creadentials for userpool user');
            });
        });
    };
    CognitoCredentials.prototype._setCredentialsFromFederation = function (federated) {
        var _this = this;
        logger.debug('set credentials from federation');
        var provider = federated.provider, token = federated.token, user = federated.user;
        var domains = {
            'google': 'accounts.google.com',
            'facebook': 'graph.facebook.com',
            'amazon': 'www.amazon.com',
            'developer': 'cognito-identity.amazonaws.com'
        };
        Cache_1.default.setItem('federatedInfo', { provider: provider, token: token, user: user }, { priority: 1 });
        var domain = domains[provider];
        if (!domain) {
            return Promise.reject(provider + ' is not supported: [google, facebook, amazon]');
        }
        var logins = {};
        logins[domain] = token;
        var _a = this._config, cognitoIdentityPoolId = _a.cognitoIdentityPoolId, cognitoRegion = _a.cognitoRegion;
        var credentials = new Common_1.AWS.CognitoIdentityCredentials({
            IdentityPoolId: cognitoIdentityPoolId,
            Logins: logins
        }, {
            region: cognitoRegion
        });
        var that = this;
        return new Promise(function (res, rej) {
            credentials.getPromise().then(function () {
                logger.debug('Load creadentials for federation user successfully', credentials);
                that._credentials = credentials;
                that._credentials.authenticated = false;
                that.credentials_source = 'federated';
                if (Common_1.AWS && Common_1.AWS.config) {
                    Common_1.AWS.config.credentials = that._credentials;
                }
                _this.gettingCred = false;
                res(that._credentials);
            }, function (err) {
                logger.debug('Failed to load creadentials for federation user', credentials);
                _this.gettingCred = false;
                rej('Failed to load creadentials for federation user');
            });
        });
    };
    return CognitoCredentials;
}());
exports.default = CognitoCredentials;
//# sourceMappingURL=CognitoCredentials.js.map