"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
var AWS = require("aws-sdk");
var CognitoAuth = (function () {
    function CognitoAuth(config) {
        this.config = config;
        this.userPool = new amazon_cognito_identity_js_1.CognitoUserPool({
            UserPoolId: config.awsUserPoolsId,
            ClientId: config.awsUserPoolsWebClientId
        });
    }
    //let cognitoUser: CognitoUser = null;
    /**********************
     * Login methods *
     **********************/
    CognitoAuth.prototype.getSignInCallback = function (cognitoUser, res, rej) {
        var _this = this;
        var signinCallback = {
            onSuccess: function (result) {
                console.log('result: ', result);
                var loginCred = 'cognito-idp.' + _this.config.region + '.amazonaws.com/' + _this.config.awsUserPoolsId;
                var Login = {};
                Login[loginCred] = result.getIdToken().getJwtToken();
                var credJson = {
                    IdentityPoolId: _this.config.awsCognitoIdentityPoolId,
                    Logins: (_a = {},
                        _a[loginCred] = result.getIdToken().getJwtToken(),
                        _a),
                };
                AWS.config.credentials = new AWS.CognitoIdentityCredentials(credJson);
                AWS.config.getCredentials(function (error) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    var _a = AWS.config.credentials, accessKeyId = _a.accessKeyId, secretAccessKey = _a.secretAccessKey, sessionToken = _a.sessionToken;
                    var awsCredentials = {
                        accessKeyId: accessKeyId,
                        secretAccessKey: secretAccessKey,
                        sessionToken: sessionToken
                    };
                });
                var _a;
            },
            onFailure: function (error) {
                console.log('sign in onFailure' + JSON.stringify(error));
                _this.logHelpfulError(error);
                rej(error);
            },
            mfaRequired: function (challengeName, challengeParameters) {
                console.log('sign in MFA required');
                console.log("cognito user from charlotte: ", cognitoUser);
                res({
                    charlottetype: "mfareq",
                    user: cognitoUser,
                    obj: {
                        challengeName: challengeName, challengeParameters: challengeParameters
                    },
                    sendCode: function (code) {
                        console.log('The code:', code);
                    }
                });
            },
            newPassword: function (userAttributes, requiredAttributes) {
                //TODO: Handle
            },
            customChallenge: function (challengeParameters) {
                //TODO: Handle
            }
        };
        return signinCallback;
    };
    ;
    CognitoAuth.prototype.handleSignIn = function (username, password) {
        var _this = this;
        console.log("in the lib: username: " + username + " password " + password);
        var authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
            Username: username,
            Password: password
        });
        console.log("Authdetails: ", authenticationDetails);
        var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise(function (res, rej) {
            console.log(typeof (username));
            console.log(typeof (password));
            cognitoUser.authenticateUser(authenticationDetails, _this.getSignInCallback(cognitoUser, res, rej));
        });
    };
    //TODO: Currently not used needed for sign in 
    CognitoAuth.prototype.sendMFAVerificationCode = function (user, code) {
        var _this = this;
        return new Promise(function (res, rej) {
            /*const sendMFACallbacks = {
                onSuccess: (session: CognitoUserSession) => {
                    res(session);
                },
                onFailure: (err: any) => {
                    rej(err);
                }
            }*/
            user.sendMFACode(code, _this.getSignInCallback(user, res, rej));
        });
    };
    /**********************
     * Registration methods *
     **********************/
    CognitoAuth.prototype.logRegistrationError = function (error) {
        var err = error.toString();
        if (/UsernameExistsException: User already exists$/.test(err)) {
            console.log(err);
        }
        else if (/InvalidParameterException?/.test(err) || /InvalidPasswordException?/.test(err)) {
            console.log(err + '. Password may not meet requirements');
        }
    };
    //TODO: This needs to be updated to accept all parameters, not just those the sample uses
    CognitoAuth.prototype.handleNewCustomerRegistration = function (username, password, signUpAttributeList) {
        var _this = this;
        var attributeList = [];
        console.log("in the func : " + username, password, signUpAttributeList);
        console.log("attribute list : ", signUpAttributeList);
        return new Promise(function (res, rej) {
            var signUpCallbacks = function (err, result) {
                if (err) {
                    rej(err);
                }
                else {
                    console.log("Signup successful now returning result ", result);
                    res(result);
                }
            };
            _this.userPool.signUp(username, password, signUpAttributeList, null, signUpCallbacks);
        });
    };
    CognitoAuth.prototype.handleSubmitVerificationCode = function (username, verificationCode) {
        var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise(function (res, rej) {
            var verificationCallback = function (err, result) {
                if (err) {
                    rej(err);
                }
                else {
                    res(result);
                }
            };
            cognitoUser.confirmRegistration(verificationCode, true, verificationCallback);
        });
    };
    CognitoAuth.prototype.handleResendVerificationCode = function (username) {
        var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise(function (res, rej) {
            var resendVerificationCallback = function (error, result) {
                if (error) {
                    rej(error);
                }
                else {
                    res(result);
                }
            };
            cognitoUser.resendConfirmationCode(resendVerificationCallback);
        });
    };
    /*************************
     * Forgot Password methods *
     *************************/
    CognitoAuth.prototype.checkResetPasswordError = function (error) {
        if ((/UserNotFoundException?/.test(error))
            || (/InvalidParameterException: Cannot reset password for the user as there is no registered?/.test(error))) {
            return { invalidCodeOrPasswordMessage: 'Invalid username' };
        }
        else if (/LimitExceededException: Attempt limit exceeded, please try after some time?/.test(error)) {
            return { invalidCodeOrPasswordMessage: 'Attempt limit exceeded, please try again later' };
        }
        else if (/CodeMismatchException?/.test(error)) {
            return { invalidCodeOrPasswordMessage: 'Invalid Verfication Code' };
        }
        else if (/InvalidParameterException: Cannot reset password for the user as there is no registered\/verified email or phone_number?$/.test(error)) {
            return { invalidCodeOrPasswordMessage: 'Cannot reset password for the user as there is no registered\/verified email or phone_number' };
        }
        else if ((/InvalidParameterException?/.test(error)) || (/InvalidPasswordException?$/.test(error))) {
            return { invalidCodeOrPasswordMessage: 'Password must contain 8 or more characters with atleast one lowercase,uppercase, numerical and special character' };
        }
    };
    CognitoAuth.prototype.handleForgotPassword = function (username) {
        var _this = this;
        var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise(function (res, rej) {
            var forgotPasswordCallBack = {
                onSuccess: function () {
                    console.log('Password reset successful');
                    res();
                },
                onFailure: function (err) {
                    console.log(err.toString());
                    //todo : convert the error messages that we get from checkResetPasswordError to log statements
                    var invalidCodeOrPasswordMessage = _this.checkResetPasswordError(err.toString());
                    rej(err);
                },
                inputVerificationCode: function (data) {
                    //resolve with data
                    res(data);
                }
            };
            cognitoUser.forgotPassword(forgotPasswordCallBack);
        });
    };
    CognitoAuth.prototype.handleForgotPasswordReset = function (username, verificationCode, newPassword) {
        var _this = this;
        var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: this.userPool
        });
        return new Promise(function (res, rej) {
            var forgotPasswordCallBack = {
                onSuccess: function () {
                    console.log('Password reset successful');
                    res();
                },
                onFailure: function (err) {
                    console.log(err.toString());
                    //todo : convert the error messages that we get from checkResetPasswordError to log statements
                    var invalidCodeOrPasswordMessage = _this.checkResetPasswordError(err.toString());
                    rej(err);
                },
                inputVerificationCode: function (data) {
                    //resolve with data
                    res(data);
                }
            };
            cognitoUser.confirmPassword(verificationCode, newPassword, forgotPasswordCallBack);
        });
    };
    /*****************
     * SignOut methods *
     *****************/
    CognitoAuth.prototype.handleSignOut = function () {
        /*
        const userPool = new CognitoUserPool({
            UserPoolId: awsmobile.aws_user_pools_id, // Your user pool id here
            ClientId: awsmobile.aws_user_pools_web_client_id // Your client id here
        });*/
        var cognitoUser = this.userPool.getCurrentUser();
        cognitoUser.signOut();
    };
    CognitoAuth.prototype.logHelpfulError = function (error) {
        var err = error.toString();
        if (/InvalidParameterException: Missing required parameter USERNAME$/.test(err)) {
            console.log(err);
        }
        else if (/UserNotFoundException?/.test(err)
            || /NotAuthorizedException?/.test(err)) {
            console.log(err + '. Username or password may be invalid.');
        }
        else if (/CodeMismatchException: Invalid code or auth state for the user.$/.test(err)) {
            console.log(err);
        }
        else if (/InvalidParameterException: Missing required parameter SMS_MFA_CODE$/.test(err)) {
            console.log(err + 'Verficiation code can not be empty');
        }
    };
    /*****************
     * Cognito federated identities methods *
     *****************/
    CognitoAuth.prototype.getCredWithThirdParty = function (token, thirdPartyProvider) {
        var Login = { thirdPartyProvider: token };
        var credJson = {
            IdentityPoolId: this.config.awsCognitoIdentityPoolId,
            Logins: Login
        };
        AWS.config.credentials = new AWS.CognitoIdentityCredentials(credJson);
        AWS.config.getCredentials(function (error) {
            if (error) {
                throw new Error('Failed to archive aws credential with the token provided.');
            }
            var _a = AWS.config.credentials, accessKeyId = _a.accessKeyId, secretAccessKey = _a.secretAccessKey, sessionToken = _a.sessionToken;
            var awsCredentials = {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
                sessionToken: sessionToken
            };
        });
    };
    return CognitoAuth;
}());
exports.default = CognitoAuth;
//# sourceMappingURL=cognito-auth.js.map