jest.mock('amazon-cognito-identity-js/lib/CognitoUserSession', () => {
    const CognitoUserSession = () => {};

    CognitoUserSession.prototype.CognitoUserSession = (options) => {
        CognitoUserSession.prototype.options = options;
        return CognitoUserSession;
    };

    CognitoUserSession.prototype.getIdToken = () => {
        return {
            getJwtToken: () => {
                return null;
            }
        };
    };

    CognitoUserSession.prototype.isValid = () => {
        return true;
    }

    CognitoUserSession.prototype.getRefreshToken = () => {
        return 'refreshToken';
    }

    return CognitoUserSession;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoIdToken', () => {
    const CognitoIdToken = () => {};

    CognitoIdToken.prototype.CognitoIdToken = (value) => {
        CognitoIdToken.prototype.idToken = value;
        return CognitoIdToken;
    };

    CognitoIdToken.prototype.getJwtToken = () => {
        return 'jwtToken';
    };


    return CognitoIdToken;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUserPool', () => {
    const CognitoUserPool = () => {};

    CognitoUserPool.prototype.CognitoUserPool = (options) => {
        CognitoUserPool.prototype.options = options;
        return CognitoUserPool;
    };

    CognitoUserPool.prototype.getCurrentUser = () => {
        return "currentUser";
    };

    CognitoUserPool.prototype.signUp = (username, password, signUpAttributeList, validationData, callback) => {
        callback(null, 'signUpResult');
    };

    return CognitoUserPool;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUser', () => {
    const CognitoUser = () => { };

    CognitoUser.prototype.CognitoUser = (options) => {
        CognitoUser.prototype.options = options;
        return CognitoUser;
    };

    CognitoUser.prototype.getSession = (callback) => {
       // throw 3;
        callback(null, "session");
    };

    CognitoUser.prototype.getUserAttributes = (callback) => {
        callback(null, "attributes");
    };

    CognitoUser.prototype.getAttributeVerificationCode = (attr, callback) => {
        callback.onSuccess("success");
    };

    CognitoUser.prototype.verifyAttribute = (attr, code, callback) => {
        callback.onSuccess("success");
    };

    CognitoUser.prototype.authenticateUser = (authenticationDetails, callback) => {
        callback.onSuccess('session');
    };

    CognitoUser.prototype.sendMFACode = (code, callback) => {
        callback.onSuccess('session');
    };

    CognitoUser.prototype.resendConfirmationCode = (callback) => {
        callback(null, 'result');
    };

    CognitoUser.prototype.changePassword = (oldPassword, newPassword, callback) => {
        callback(null, 'SUCCESS');
    };

    CognitoUser.prototype.forgotPassword = (callback) => {
        callback.onSuccess();
    };

    CognitoUser.prototype.confirmPassword = (code, password, callback) => {
        callback.onSuccess();
    };

    CognitoUser.prototype.signOut = () => {

    };

    CognitoUser.prototype.globalSignOut = (callback) => {
        callback.onSuccess();
    };

    CognitoUser.prototype.confirmRegistration = (confirmationCode, forceAliasCreation, callback) => {
        callback(null, 'Success');
    };

    CognitoUser.prototype.completeNewPasswordChallenge = (password, requiredAttributes, callback) => {
        callback.onSuccess('session');
    };

    CognitoUser.prototype.updateAttributes = (attributeList, callback) => {
        callback(null, 'SUCCESS');
    };

    CognitoUser.prototype.setAuthenticationFlowType = (type) => {

    };

    CognitoUser.prototype.initiateAuth = (authenticationDetails, callback) => {
        callback.customChallenge('challengeParam');
    };

    CognitoUser.prototype.sendCustomChallengeAnswer = (challengeAnswer, callback) => {
        callback.onSuccess('session');
    };

    CognitoUser.prototype.refreshSession = (refreshToken, callback) => {
        callback(null, 'session');
    }

    CognitoUser.prototype.getUserData = (callback) => {
        callback(null, 'data');
    }

    return CognitoUser;
});

jest.mock('amazon-cognito-auth-js/lib/CognitoAuth', () => {
    const CognitoAuth = () => {};

    CognitoAuth.prototype.parseCognitoWebResponse = () => {
        CognitoAuth.prototype.userhandler.onSuccess();
        throw 'err';
    }

    return CognitoAuth;
});

import { AuthOptions, SignUpParams } from '../src/types';
import Auth from '../src/Auth';
import Cache from '@aws-amplify/cache';
import { CookieStorage, CognitoUserPool, CognitoUser, CognitoUserSession, CognitoIdToken, CognitoAccessToken } from 'amazon-cognito-identity-js';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { Credentials, GoogleOAuth, StorageHelper } from '@aws-amplify/core';

const authOptions : AuthOptions = {
    userPoolId: "awsUserPoolsId",
    userPoolWebClientId: "awsUserPoolsWebClientId",
    region: "region",
    identityPoolId: "awsCognitoIdentityPoolId",
    mandatorySignIn: false
}

const authOptionsWithNoUserPoolId : AuthOptions = {
    userPoolId: null,
    userPoolWebClientId: "awsUserPoolsWebClientId",
    region: "region",
    identityPoolId: "awsCognitoIdentityPoolId",
    mandatorySignIn: false
}

const userPool = new CognitoUserPool({
    UserPoolId: authOptions.userPoolId,
    ClientId: authOptions.userPoolWebClientId
});

const idToken = new CognitoIdToken({ IdToken: 'idToken' });
const accessToken = new CognitoAccessToken({ AccessToken: 'accessToken' });

const session = new CognitoUserSession({
    IdToken: idToken,
    AccessToken: accessToken
});

const cognitoCredentialSpyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'get').mockImplementation((callback) => {
    callback(null);
});

describe('auth unit test', () => {
    describe('signUp', () => {
        test('happy case with object attr', async () => {
            const spyon = jest.spyOn(CognitoUserPool.prototype, "signUp");
            const auth = new Auth(authOptions);

            const attrs = {
                username: 'username',
                password: 'password',
                attributes: {
                    email: 'email',
                    phone_number: 'phone_number',
                    otherAttrs: 'otherAttrs'
                }
            };
        
            expect(await auth.signUp(attrs)).toBe('signUpResult');

            spyon.mockClear();
        });

        test('object attr with null username', async () => {
            const auth = new Auth(authOptions);

            const attrs = {
                username: null,
                password: 'password',
                attributes: {
                    email: 'email',
                    phone_number: 'phone_number',
                    otherAttrs: 'otherAttrs'
                }
            };
            expect.assertions(1);
            try {
                await auth.signUp(attrs);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('callback error', async () => {
            const spyon = jest.spyOn(CognitoUserPool.prototype, "signUp")
                .mockImplementationOnce((username, password, signUpAttributeList, validationData, callback) => {
                    callback('err', null);
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                const attrs = {
                    username: 'username',
                    password: 'password',
                    attributes: {
                        email: 'email',
                        phone_number: 'phone_number',
                        otherAttrs: 'otherAttrs'
                    }
                };
                await auth.signUp(attrs);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no user pool', async () => {
            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.signUp('username', 'password', 'email', 'phone');
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('no username', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signUp(null, 'password', 'email', 'phone');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no password', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signUp('username', null, 'email', 'phone');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('only username', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signUp('username');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });

    describe('confirmSignUp', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "confirmRegistration");
            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.confirmSignUp('username', 'code')).toBe('Success');

            spyon.mockClear();
        });

        test('with options', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "confirmRegistration");
            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.confirmSignUp('username', 'code', {forceAliasCreation: false})).toBe('Success');

            spyon.mockClear();
        });

        test('callback err', async () => {
             const spyon = jest.spyOn(CognitoUser.prototype, "confirmRegistration")
                .mockImplementationOnce((confirmationCode, forceAliasCreation, callback) => {
                    callback('err', null);
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.confirmSignUp('username', 'code');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no user pool', async () => {
            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.confirmSignUp('username', 'code');
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('no user name', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.confirmSignUp(null, 'code');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no code', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.confirmSignUp('username', null);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });

    describe('resendSignUp', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "resendConfirmationCode");
            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.resendSignUp('username')).toBe('result');

            spyon.mockClear();
        });

        test('callback err', async () => {
             const spyon = jest.spyOn(CognitoUser.prototype, "resendConfirmationCode")
                .mockImplementationOnce((callback) => {
                    callback('err', null);
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.resendSignUp('username');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no user pool', async () => {
            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.resendSignUp('username');
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('no username', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.resendSignUp(null);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });

    describe('signIn', () => {
        test('happy case with password', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser')
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.onSuccess(session);
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(user);

            spyon.mockClear();
        });

        test('happy case using cookie storage', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser')
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.onSuccess(session);
                });

            const auth = new Auth({ ...authOptions, cookieStorage: { domain: ".example.com" } });
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool,
                Storage: new CookieStorage({ domain: ".yourdomain.com" })
            });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(user);

            spyon.mockClear();
        });

        test('onFailure', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "authenticateUser")
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signIn('username', 'password');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('mfaRequired', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "authenticateUser")
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.mfaRequired('challengeName', 'challengeParam');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterSignedIn = Object.assign(
                {},
                user,
                {
                    "challengeName": "challengeName",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(userAfterSignedIn);

            spyon.mockClear();
        });

        test('mfaSetup', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "authenticateUser")
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.mfaSetup('challengeName', 'challengeParam');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterSignedIn = Object.assign(
                {},
                user,
                {
                    "challengeName": "challengeName",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(userAfterSignedIn);

            spyon.mockClear();
        });

        test('totpRequired', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "authenticateUser")
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.totpRequired('challengeName', 'challengeParam');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterSignedIn = Object.assign(
                {},
                user,
                {
                    "challengeName": "challengeName",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(userAfterSignedIn);

            spyon.mockClear();
        });

        test('selectMFAType', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "authenticateUser")
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.selectMFAType('challengeName', 'challengeParam');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterSignedIn = Object.assign(
                {},
                user,
                {
                    "challengeName": "challengeName",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(userAfterSignedIn);

            spyon.mockClear();
        });

        test('newPasswordRequired', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "authenticateUser")
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.newPasswordRequired('userAttributes', 'requiredAttributes');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterSignedIn = Object.assign(
                {},
                user,
                {
                    "challengeName": "NEW_PASSWORD_REQUIRED",
                    "challengeParam": {
                        "requiredAttributes": "requiredAttributes",
                        "userAttributes": "userAttributes"
                    }
                });

            expect.assertions(1);
            expect(await auth.signIn('username', 'password')).toEqual(userAfterSignedIn);

            spyon.mockClear();
        });

        test('customChallenge', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser')
                .mockImplementationOnce((authenticationDetails, callback) => {
                    callback.customChallenge('challengeParam');
                });
            const spyon2 = jest.spyOn(CognitoUser.prototype, 'setAuthenticationFlowType')
                .mockImplementationOnce((type) => {

                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterSignedIn = Object.assign(
                {},
                user,
                {
                    "challengeName": "CUSTOM_CHALLENGE",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(2);
            expect(await auth.signIn('username')).toEqual(userAfterSignedIn);
            expect(spyon2).toBeCalledWith('CUSTOM_AUTH');

            spyon2.mockClear();
            spyon.mockClear();
        });

        test('no userPool', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');

            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.signIn('username', 'password');
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });

        test('no username', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signIn(null, 'password');
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
        });

    describe("confirmSignIn", () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "sendMFACode")
                .mockImplementationOnce((code, callback) => {
                    callback.onSuccess(session);
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.confirmSignIn(user, 'code', null)).toEqual(user);

            spyon.mockClear();
        });

        test('onFailure', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "sendMFACode")
                .mockImplementationOnce((code, callback) => {
                    callback.onFailure('err');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            try {
                await auth.confirmSignIn(user, 'code', null);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no code', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "sendMFACode");
            const auth = new Auth(authOptions);

            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.confirmSignIn(user, null, null);
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
    });

    describe('completeNewPassword', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
                .mockImplementationOnce((password, requiredAttributes, callback) => {
                    callback.onSuccess(session);
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.completeNewPassword(user, 'password', {})).toEqual(user);

            spyon.mockClear();
        });

        test('on Failure', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
                .mockImplementationOnce((password, requiredAttributes, callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.completeNewPassword(user, 'password', {});
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('mfaRequired', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
                .mockImplementationOnce((password, requiredAttributes, callback) => {
                    callback.mfaRequired('challengeName', 'challengeParam');
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.completeNewPassword(user, 'password', {})).toBe(user);

            spyon.mockClear();
        });

        test('mfaSetup', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'completeNewPasswordChallenge')
                .mockImplementationOnce((password, requiredAttributes, callback) => {
                    callback.mfaSetup('challengeName', 'challengeParam');
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.completeNewPassword(user, 'password', {})).toBe(user);

            spyon.mockClear();
        });

        test('no password', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.completeNewPassword(user, null, {});
            } catch (e) {
                expect(e).toBe('Password cannot be empty');
            }
        });
    });

    describe('userAttributes', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(Auth.prototype, 'userSession')
                .mockImplementationOnce((user) => {
                    return new Promise((res, rej) => {
                        res('session');
                    });
                });

            const spyon2 = jest.spyOn(CognitoUser.prototype, 'getUserAttributes');

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.userAttributes(user)).toBe('attributes');

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('get userattributes failed', async () => {
            const spyon = jest.spyOn(Auth.prototype, 'userSession')
                .mockImplementationOnce((user) => {
                    return new Promise((res, rej) => {
                        res('session');
                    });
                });

            const spyon2 = jest.spyOn(CognitoUser.prototype, 'getUserAttributes')
                .mockImplementationOnce((callback) => {
                    callback('err');
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.userAttributes(user);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('currentSession', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(auth, "currentUserPoolUser")
                .mockImplementationOnce(() => {
                    return Promise.resolve(user);
                });

            const spyon2 = jest.spyOn(Auth.prototype, 'userSession').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(session);
                })
            });
            expect.assertions(1);
            expect(await auth.currentSession()).toEqual(session);

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('no current session', async () => {
            const auth = new Auth(authOptions);

            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(auth, "currentUserPoolUser")
                .mockImplementationOnce(() => {
                    return Promise.resolve(user);
                });

            const spyon2 = jest.spyOn(auth, 'userSession').mockImplementationOnce(() => {
                return Promise.reject('cannot get the session');
            });

            expect.assertions(1);
            try {
                await auth.currentSession();
            } catch (e) {
                expect(e).toBe('cannot get the session');
            }

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('no current user', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(auth, "currentUserPoolUser")
                .mockImplementationOnce(() => {
                    return Promise.reject('no current user')
                });

            expect.assertions(1);
            try {
                await auth.currentSession();
            } catch (e) {
                expect(e).toBe('no current user');
            }

            spyon.mockClear();
        });

        test('no UserPool', async () => {
            const auth = new Auth({
                userPoolId: undefined,
                userPoolWebClientId: "awsUserPoolsWebClientId",
                region: "region",
                identityPoolId: "awsCognitoIdentityPoolId",
                mandatorySignIn: false
            });

            expect.assertions(1);
            try {
                await auth.currentSession();
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });
    });

    describe('currentAuthenticatedUser', () => {
        test('happy case with source userpool', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res(user);
                    });
                });
            expect.assertions(1);
            expect(await auth.currentAuthenticatedUser()).toEqual(user);

            spyon.mockClear();
        });

        test('happy case with source federation', async () => {
            const spyon = jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
                return {
                    getItem() {
                        return JSON.stringify({
                            user: 'federated_user'
                        });
                    }
                }
            });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.currentAuthenticatedUser()).toBe('federated_user');

            spyon.mockClear();
        });
    });

    describe('userSession test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'getSession').mockImplementationOnce((callback) => {
                callback(null, session);
            });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.userSession(user)).toEqual(session);

            spyon.mockClear();
        });

        test('callback error', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUser.prototype, "getSession")
                .mockImplementationOnce((callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try {
                await auth.userSession(user);
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no user', async () => {
            const auth = new Auth(authOptions);
            const user = null;

            expect.assertions(1);
            try {
                await auth.userSession(user);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });

    describe('currentUserCredentials test', () => {
        test('with federated info', async () => {
            const spyon = jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
                return {
                    getItem() {
                        return JSON.stringify({
                            provider: 'google',
                            token: 'token'
                        });
                    }
                }
            });

            const auth = new Auth(authOptions);

            const spyon2 = jest.spyOn(Credentials, 'refreshFederatedToken').mockImplementationOnce(() => {
                return Promise.resolve('cred');
            });

            expect.assertions(1);
            expect(await auth.currentUserCredentials()).toBe('cred');

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('with cognito session', async () => {
            const spyon = jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
                return {
                    getItem() {
                        return null;
                    }
                }
            });
            const auth = new Auth(authOptions);

            const spyon2 = jest.spyOn(auth, 'currentSession').mockImplementationOnce(() => {
                return Promise.resolve('session');
            });

            const spyon3 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.resolve('cred');
            });

            expect.assertions(1);
            expect(await auth.currentUserCredentials()).toBe('cred');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('with guest', async () => {
            const spyon = jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
                return {
                    getItem() {
                        return null;
                    }
                }
            });
            const auth = new Auth(authOptions);

            const spyon2 = jest.spyOn(auth, 'currentSession').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            const spyon3 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.resolve('cred');
            });

            expect.assertions(1);
            expect(await auth.currentUserCredentials()).toBe('cred');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('json parse error', async () => {
            const spyon = jest.spyOn(StorageHelper.prototype, 'getStorage').mockImplementation(() => {
                return {
                    getItem() {
                        return undefined;
                    }
                }
            });
            const auth = new Auth(authOptions);

            const spyon2 = jest.spyOn(auth, 'currentSession').mockImplementationOnce(() => {
                return Promise.resolve('session');
            });

            const spyon3 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.resolve('cred');
            });

            expect.assertions(1);
            expect(await auth.currentUserCredentials()).toBe('cred');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });
    });

    describe('currentCrendentials', () => {
        const spyon = jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
            return;
        });

        const auth = new Auth(authOptions);

        auth.currentCredentials();
        expect(spyon).toBeCalled();
        spyon.mockClear();
    });

    describe('verifyUserAttribute test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "getAttributeVerificationCode");

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.verifyUserAttribute(user, {})).toBe("success");

            spyon.mockClear();

        });

        test('onFailure', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "getAttributeVerificationCode")
                .mockImplementationOnce((attr, callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.verifyUserAttribute(user, {});
            } catch (e) {
                expect(e).toBe("err");
            }

            spyon.mockClear();
        });
    });

    describe('verifyUserAttributeSubmit', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "verifyAttribute");

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.verifyUserAttributeSubmit(user, {}, 'code')).toBe("success");

            spyon.mockClear();
        });

        test('onFailure', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "verifyAttribute")
                .mockImplementationOnce((attr, code, callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.verifyUserAttributeSubmit(user, {}, 'code');
            } catch (e) {
                expect(e).toBe("err");
            }

            spyon.mockClear();
        });

        test('code empty', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.verifyUserAttributeSubmit(user, {}, null);
            } catch (e) {
                expect(e).toBe('Code cannot be empty');
            }
        });
    });

    describe('verifyCurrentUserAttribute test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res(user);
                    });
                });

            const spyon2 = jest.spyOn(Auth.prototype, 'verifyUserAttribute')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res();
                    });
                });

            await auth.verifyCurrentUserAttribute('attr');

            expect.assertions(2);
            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalledWith(user, 'attr');

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('verifyCurrentUserAttributeSubmit test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res(user);
                    });
                });

            const spyon2 = jest.spyOn(Auth.prototype, 'verifyUserAttributeSubmit')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res();
                    });
                });

            await auth.verifyCurrentUserAttributeSubmit('attr', 'code');

            expect.assertions(2);
            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalledWith(user, 'attr', 'code');

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('signOut test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(Credentials, 'clear').mockImplementationOnce(() => {
                return
            });
            const spyon2 = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
            .mockImplementationOnce(() => {
                return user;
            });

            await auth.signOut();

            expect.assertions(2);
            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalled();
            
            spyon.mockClear();
            spyon2.mockClear();
        });

        test('happy case for source userpool', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            auth['credentials_source'] = 'aws';
            auth['credentials'] = new CognitoIdentityCredentials({
                IdentityPoolId: 'identityPoolId'
            });

            const spyonAuth = jest.spyOn(Auth.prototype, "currentUserCredentials")
            .mockImplementationOnce(() => {
                return new Promise((resolve, reject) => { resolve(); });
            });
            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
            .mockImplementationOnce(() => {
                return user;
            });
            const spyon2 = jest.spyOn(CognitoUser.prototype, "signOut");
            // @ts-ignore

            await auth.signOut();

            expect.assertions(1);
            expect(spyon2).toBeCalled();

            spyonAuth.mockClear();
            spyon.mockClear();
            spyon2.mockClear();
        });

        test('happy case for globalSignOut', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyonAuth = jest.spyOn(Credentials, "clear")
            .mockImplementationOnce(() => {
                return Promise.resolve();
            });
            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
            .mockImplementationOnce(() => {
                return user;
            });
            const spyon2 = jest.spyOn(CognitoUser.prototype, "globalSignOut");

            await auth.signOut({global: true});

            expect.assertions(1);
            expect(spyon2).toBeCalled();

            spyonAuth.mockClear();
            spyon.mockClear();
            spyon2.mockClear();
        });

        test('happy case for no userpool', async () => {
            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect(await auth.signOut()).toBeUndefined();            
        });

        test('no User in userpool', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementationOnce(() => {
                    return null;
                });
            expect(await auth.signOut()).toBeUndefined();           

            spyon.mockClear();
        });

        test('get guest credentials failed', async() => {
            const auth = new Auth(authOptionsWithNoUserPoolId);

            const cognitoCredentialSpyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'get').mockImplementation((callback) => {
                callback(null);
            });

            expect(await auth.signOut()).toBeUndefined();     

            cognitoCredentialSpyon.mockClear();
        });
    });

    describe('changePassword', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const oldPassword = 'oldPassword1';
            const newPassword = 'newPassword1.';

            const spyon = jest.spyOn(Auth.prototype, 'userSession').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(session);
                })
            });

            expect.assertions(1);
            expect(await auth.changePassword(user, oldPassword, newPassword)).toBe('SUCCESS');

            spyon.mockClear();
        });
    });

    describe('forgotPassword', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "forgotPassword");

            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.forgotPassword('username')).toBeUndefined();

            spyon.mockClear();
        });

        test('onFailue', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "forgotPassword")
                .mockImplementationOnce((callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.forgotPassword('username');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('inputVerficationCode', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "forgotPassword")
                .mockImplementationOnce((callback) => {
                    callback.inputVerificationCode('data');
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.forgotPassword('username')).toBe('data');

            spyon.mockClear();
        });

        test('no user pool id', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "forgotPassword");

            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.forgotPassword('username');
            } catch (e) {
                expect(e).not.toBeNull();
            }
            spyon.mockClear();
        });

        test('no username', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "forgotPassword");

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.forgotPassword(null);
            } catch (e) {
                expect(e).not.toBeNull();
            }
            spyon.mockClear();
        });
    });

    describe('forgotPasswordSubmit', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "confirmPassword");

            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.forgotPasswordSubmit('username', 'code', 'password')).toBeUndefined();

            spyon.mockClear();
        });

        test('confirmPassword failed', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "confirmPassword")
                .mockImplementationOnce((code, password, callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.forgotPasswordSubmit('username', 'code', 'password');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no user pool', async () => {
            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.forgotPasswordSubmit('username', 'code', 'password');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no username', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.forgotPasswordSubmit(null, 'code', 'password');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no code', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.forgotPasswordSubmit('username', null, 'password');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no password', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.forgotPasswordSubmit('username', 'code', null);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });

    describe('currentUserInfo test', () => {
        test('happy case with aws or userpool source', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            username: 'username'
                        });
                    });
                });

            const spyon2 = jest.spyOn(Auth.prototype, 'userAttributes')
                .mockImplementationOnce(() => {
                    auth['credentials'] = new CognitoIdentityCredentials({
                        IdentityPoolId: 'identityPoolId',
                        IdentityId: 'identityId'
                    });
                    auth['credentials']['identityId'] = 'identityId';
                    return new Promise((res, rej) => {
                        res([
                            { Name: 'email', Value: 'email' },
                            { Name: 'phone_number', Value: 'phone_number' },
                            { Name: 'email_verified', Value: 'false' },
                            { Name: 'phone_number_verified', Value: 'true' },
                            { Name: 'sub', Value: '123-456789' }
                        ]);
                    });
                });

            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return Promise.resolve({
                    identityId: 'identityId'
                });
            });

            const spyon4 = jest.spyOn(Credentials, 'getCredSource').mockImplementationOnce(() => {
                return 'aws';
            });

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toEqual({
                username: 'username',
                id: 'identityId',
                attributes: {
                    email: 'email',
                    phone_number: 'phone_number',
                    email_verified: false,
                    phone_number_verified: true,
                    sub: "123-456789"
                }
            });

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
            spyon4.mockClear();
        });

        test('return empty object if error happens', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            username: 'username'
                        });
                    });
                });

            const spyon2 = jest.spyOn(Auth.prototype, 'userAttributes')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            const spyon3 = jest.spyOn(Auth.prototype, 'currentCredentials').mockImplementationOnce(() => {
                return Promise.resolve({
                    IdentityPoolId: 'identityPoolId',
                    identityId: 'identityId'
                });
            });

            const spyon4 = jest.spyOn(Credentials, 'getCredSource').mockImplementationOnce(() => {
                return 'aws';
            });

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toEqual({});

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
            spyon4.mockClear();
        });

        test('no current userpool user', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            auth['credentials_source'] = 'aws';

            const spyon = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res(null);
                    });
                });

            const spyon2 = jest.spyOn(Credentials, 'getCredSource').mockImplementationOnce(() => {
                return 'aws';
            });

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toBeNull();

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('federated user', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            auth['user'] = 'federated_user';

            const spyon = jest.spyOn(Credentials, 'getCredSource').mockImplementationOnce(() => {
                return 'federated';
            });

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toBe('federated_user');

            spyon.mockClear();
        });
    });

    describe('updateUserAttributes test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const attributes = {
                'email': 'email',
                'phone_number': 'phone_number',
                'sub': 'sub'
            }
            const spyon = jest.spyOn(Auth.prototype, 'userSession').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(session);
                })
            });
            
            expect.assertions(1);
            expect(await auth.updateUserAttributes(user,attributes)).toBe('SUCCESS');

            spyon.mockClear();
        });
    });

    describe('federatedSignIn test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.resolve('cred');
            });

            auth.federatedSignIn('google', { token: 'token', expires_at: 1234 }, { user: 'user' });

            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('verifiedContact test', () => {
        test('happy case with unverified', async () => {
            const spyon = jest.spyOn(Auth.prototype, 'userAttributes')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res([{
                            Name: 'email',
                            Value: 'email@amazon.com'
                        },
                        {
                            Name: 'phone_number',
                            Value: '+12345678901'
                        }]);
                    });
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect(await auth.verifiedContact(user)).toEqual({
                "unverified": { "email": "email@amazon.com", "phone_number": "+12345678901" },
                "verified": {}
            });

            spyon.mockClear();
        });

        test('happy case with unverified', async () => {
            const spyon = jest.spyOn(Auth.prototype, 'userAttributes')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res([{
                            Name: 'email',
                            Value: 'email@amazon.com'
                        },
                        {
                            Name: 'phone_number',
                            Value: '+12345678901'
                        },
                        {
                            Name: 'email_verified',
                            Value: true
                        },
                        {
                            Name: 'phone_number_verified',
                            Value: true
                        }]);
                    });
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect(await auth.verifiedContact(user)).toEqual({
                "unverified": {},
                "verified": { "email": "email@amazon.com", "phone_number": "+12345678901" }
            });

            spyon.mockClear();
        });
    });

    describe('currentUserPoolUser test', () => {
        test('happy case', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementation(() => {
                    return user;
                });
            const spyon2 = jest.spyOn(CognitoUser.prototype, 'getSession')
                .mockImplementation((callback) => {
                    return callback(null, 'session');
                });
            const spyon3 = jest.spyOn(CognitoUser.prototype, 'getUserData').mockImplementationOnce((callback) => {
                const data = {
                    PreferredMfaSetting: 'SMS',
                    UserAttributes: [
                        {Name: 'address', Value: 'xxxx'}
                    ]
                };
                callback(null, data);
            });
            
            expect.assertions(1);
            expect(await auth.currentUserPoolUser()).toBe(Object.assign(user, {
                attributes: {
                    address: 'xxxx'
                },
                preferredMFA: 'SMS'
            }));

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('no current user', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementation(() => {
                    return null;
                });

            expect.assertions(1);
            try {
                await auth.currentUserPoolUser();
            } catch (e) {
                expect(e).toBe('No current user');
            }

            spyon.mockClear();
        });

        test('No userPool', async () => {
            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            try {
                await auth.currentUserPoolUser();
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('get session error', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementation(() => {
                    return user;
                });
            const spyon2 = jest.spyOn(CognitoUser.prototype, 'getSession')
                .mockImplementation((callback) => {
                    return callback('err', null);
                });

            const spyon3 = jest.spyOn(CognitoUser.prototype, 'getUserData');

            expect.assertions(2);
            try {
                await auth.currentUserPoolUser();
            } catch (e) {
                expect(e).toBe('err');
                expect(spyon3).not.toBeCalled();
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('get user data error because of user is deleted or disabled', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementation(() => {
                    return user;
                });
            const spyon2 = jest.spyOn(CognitoUser.prototype, 'getSession')
                .mockImplementation((callback) => {
                    return callback(null, 'session');
                });
            const spyon3 = jest.spyOn(CognitoUser.prototype, 'getUserData').mockImplementationOnce((callback) => {
                callback({
                    message: 'User is disabled'
                }, null);
            });
            
            expect.assertions(1);
            try {
                await auth.currentUserPoolUser();
            } catch (e) {
                expect(e).toEqual({
                    message: 'User is disabled'
                });
            }

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('bypass the error if the user is not deleted or disabled', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementation(() => {
                    return user;
                });
            const spyon2 = jest.spyOn(CognitoUser.prototype, 'getSession')
                .mockImplementation((callback) => {
                    return callback(null, 'session');
                });
            const spyon3 = jest.spyOn(CognitoUser.prototype, 'getUserData').mockImplementationOnce((callback) => {
                callback({
                    message: 'other error'
                }, null);
            });
            
            expect.assertions(1);
     
            expect(await auth.currentUserPoolUser()).toEqual(user);
        

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });
    });

    describe('sendCustomChallengeAnswer', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer')
                .mockImplementationOnce((challengeResponses, callback) => {
                    callback.onSuccess(session);
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterCustomChallengeAnswer = Object.assign(
                new CognitoUser({
                    Username: 'username',
                    Pool: userPool
                }),
                {
                    "challengeName": "CUSTOM_CHALLENGE",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            expect(await auth.sendCustomChallengeAnswer(userAfterCustomChallengeAnswer, 'challengeResponse')).toEqual(user);

            spyon.mockClear();
        });

        test('customChallenge', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer')
                .mockImplementationOnce((challengeResponses, callback) => {
                    callback.customChallenge('challengeParam');
                });
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            const userAfterCustomChallengeAnswer = Object.assign(
                new CognitoUser({
                    Username: 'username',
                    Pool: userPool
                }),
                {
                    "challengeName": "CUSTOM_CHALLENGE",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            expect(await auth.sendCustomChallengeAnswer(userAfterCustomChallengeAnswer, 'challengeResponse')).toEqual(userAfterCustomChallengeAnswer);

            spyon.mockClear();
        });

        test('onFailure', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer')
                .mockImplementationOnce((challengeResponses, callback) => {
                    callback.onFailure('err');
                });

            const auth = new Auth(authOptions);
            const userAfterCustomChallengeAnswer = Object.assign(
                new CognitoUser({
                    Username: 'username',
                    Pool: userPool
                }),
                {
                    "challengeName": "CUSTOM_CHALLENGE",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            try {
                await auth.sendCustomChallengeAnswer(userAfterCustomChallengeAnswer, 'challengeResponse');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no userPool', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'sendCustomChallengeAnswer');

            // @ts-ignore
            const auth = new Auth(authOptionsWithNoUserPoolId);
            const userAfterCustomChallengeAnswer = Object.assign(
                new CognitoUser({
                    Username: 'username',
                    Pool: userPool
                }),
                {
                    "challengeName": "CUSTOM_CHALLENGE",
                    "challengeParam": "challengeParam"
                });

            expect.assertions(1);
            try {
                await auth.sendCustomChallengeAnswer(userAfterCustomChallengeAnswer, 'challengeResponse');
            } catch (e) {
                expect(e).toBe('No userPool');
            }

            spyon.mockClear();
        });
    });

    describe('hosted ui test', () => {
        test('happy case', () => {
            const oauth = {};

            const authOptions = {
                Auth: {
                    userPoolId: "awsUserPoolsId",
                    userPoolWebClientId: "awsUserPoolsWebClientId",
                    region: "region",
                    identityPoolId: "awsCognitoIdentityPoolId",
                    oauth
                }
            };
            const spyon = jest.spyOn(Auth.prototype, 'currentAuthenticatedUser').mockImplementationOnce(() => {
                return Promise.reject('err');
            });


            const auth = new Auth(authOptions);
            expect(spyon).toBeCalled();

            spyon.mockClear();
          
        });
    });
});


    

