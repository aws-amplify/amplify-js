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
var AWS = require("aws-sdk/global");
var cognito_auth_1 = require("./cognito-auth");
var ErrorUtils_1 = require("../Core/ErrorUtils");
/**
* Provide authentication steps
*/
var Auth = (function () {
    function Auth(options) {
        var awsUserPoolsId = options.awsUserPoolsId, awsUserPoolsWebClientId = options.awsUserPoolsWebClientId, region = options.region, awsCognitoIdentityPoolId = options.awsCognitoIdentityPoolId;
        if (!awsUserPoolsId) {
            ErrorUtils_1.default.missingParameter('awsUserPoolsId');
        }
        if (!awsUserPoolsWebClientId) {
            ErrorUtils_1.default.missingParameter('awsUserPoolsWebClientId');
        }
        if (!awsCognitoIdentityPoolId) {
            ErrorUtils_1.default.missingParameter('awsCognitoIdentityPoolId');
        }
        this.authOptions = {
            awsUserPoolsId: awsUserPoolsId,
            awsUserPoolsWebClientId: awsUserPoolsWebClientId,
            region: region || AWS.config.region,
            awsCognitoIdentityPoolId: awsCognitoIdentityPoolId
        };
        this.cognitoAuth = new cognito_auth_1.default(this.authOptions);
    }
    //TODO: Currently we are returning Promise<**CognitoInterface**> We should make sure this is want we want to return. We may want a middle layer that is either more helpful or more generic so we are not tied to Cognito.
    Auth.prototype.signUp = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("params for signup on library side ", params);
                return [2 /*return*/, this.cognitoAuth.handleNewCustomerRegistration(params.username, params.password, params.SignupAttributes)];
            });
        });
    };
    Auth.prototype.confirmSignUp = function (username, verificationCode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("username" + username);
                return [2 /*return*/, this.cognitoAuth.handleSubmitVerificationCode(username, verificationCode)];
            });
        });
    };
    Auth.prototype.resendSignUpMFA = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cognitoAuth.handleResendVerificationCode(username)];
            });
        });
    };
    Auth.prototype.signIn = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("2: us" + typeof (username) + "pass" + typeof (password));
                console.log("username: " + username + " password: " + password);
                return [2 /*return*/, this.cognitoAuth.handleSignIn(username, password)];
            });
        });
    };
    Auth.prototype.submitSignInMFA = function (user, verificationCode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("MFA code and username : ", verificationCode);
                console.log("user is ::: " + user);
                //user = JSON.parse(user);
                console.log("cog user : ", JSON.stringify(user));
                return [2 /*return*/, this.cognitoAuth.sendMFAVerificationCode(user, verificationCode)];
            });
        });
    };
    Auth.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cognitoAuth.handleSignOut()];
            });
        });
    };
    Auth.prototype.forgotPassword = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cognitoAuth.handleForgotPassword(username)];
            });
        });
    };
    Auth.prototype.confirmMFAForgotPassword = function (username, verificationCode, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cognitoAuth.handleForgotPasswordReset(username, verificationCode, newPassword)];
            });
        });
    };
    Auth.prototype.getCredWithThirdParty = function (token, thirdPartyProvider) {
        this.cognitoAuth.getCredWithThirdParty(token, thirdPartyProvider);
    };
    return Auth;
}());
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map