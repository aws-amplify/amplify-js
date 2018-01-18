jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    return Pinpoint;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUserSession', () => {
    const CognitoUserSession = () => {}

    CognitoUserSession.prototype.CognitoUserSession = (options) => {
        CognitoUserSession.prototype.options = options;
        return CognitoUserSession;
    }

    CognitoUserSession.prototype.getIdToken = () => {
        return {
            getJwtToken: () => {
                return null;
            }
        }
    }

    return CognitoUserSession;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoIdToken', () => {
    const CognitoIdToken = () => {}

    CognitoIdToken.prototype.CognitoIdToken = (value) => {
        CognitoIdToken.prototype.idToken = value;
        return CognitoIdToken;
    }

    CognitoIdToken.prototype.getJwtToken = () => {
        return 'jwtToken';
    }


    return CognitoIdToken;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUserPool', () => {
    const CognitoUserPool = () => {};

    CognitoUserPool.prototype.CognitoUserPool = (options) => {
        CognitoUserPool.prototype.options = options;
        return CognitoUserPool;
    }

    CognitoUserPool.prototype.getCurrentUser = () => {
        return "currentUser";
    }

    CognitoUserPool.prototype.signUp = (username, password, signUpAttributeList, validationData, callback) => {
        callback(null, 'signUpResult');
    }

    return CognitoUserPool;
});

jest.mock('amazon-cognito-identity-js/lib/CognitoUser', () => {
    const CognitoUser = () => {}

    CognitoUser.prototype.CognitoUser = (options) => {
        CognitoUser.prototype.options = options;
        return CognitoUser;
    }

    CognitoUser.prototype.getSession = (callback) => {
       // throw 3;
        callback(null, "session");
    }

    CognitoUser.prototype.getUserAttributes = (callback) => {
        callback(null, "attributes");
    }

    CognitoUser.prototype.getAttributeVerificationCode = (attr, callback) => {
        callback.onSuccess("success");
    }

    CognitoUser.prototype.verifyAttribute = (attr, code, callback) => {
        callback.onSuccess("success");
    }

    CognitoUser.prototype.authenticateUser = (authenticationDetails, callback) => {
        callback.onSuccess('session');
    }

    CognitoUser.prototype.sendMFACode = (code, callback) => {
        callback.onSuccess('session');
    }

    CognitoUser.prototype.resendConfirmationCode = (callback) => {
        callback(null, 'result');
    }

    CognitoUser.prototype.forgotPassword = (callback) => {
        callback.onSuccess();
    }

    CognitoUser.prototype.confirmPassword = (code, password, callback) => {
        callback.onSuccess();
    }

    CognitoUser.prototype.signOut = () => {

    }

    CognitoUser.prototype.confirmRegistration = (confirmationCode, forceAliasCreation, callback) => {
        callback(null, 'Success');
    }

    CognitoUser.prototype.completeNewPasswordChallenge = (password, requiredAttributes, callback) => {
        callback.onSuccess('session');
    }

    return CognitoUser;
});

import { AuthOptions, SignUpParams } from '../../src/Auth/types';
import Auth from '../../src/Auth/Auth';
import Cache from '../../src/Cache';
import { CognitoUserPool, CognitoUser, CognitoUserSession, CognitoIdToken, CognitoAccessToken } from 'amazon-cognito-identity-js';
import { CognitoIdentityCredentials } from 'aws-sdk';

const authOptions: AuthOptions = {
    userPoolId: "awsUserPoolsId",
    userPoolWebClientId: "awsUserPoolsWebClientId",
    region: "region",
    identityPoolId: "awsCognitoIdentityPoolId"
}

const authOptionsWithNoUserPoolId = {
    userPoolId: null,
    userPoolWebClientId: "awsUserPoolsWebClientId",
    region: "region",
    identityPoolId: "awsCognitoIdentityPoolId"
}

const userPool = new CognitoUserPool({
    UserPoolId: authOptions.userPoolId,
    ClientId: authOptions.userPoolWebClientId
});

const idToken = new CognitoIdToken({IdToken: 'idToken'});
const accessToken = new CognitoAccessToken({AccessToken: 'accessToken'});

const session = new CognitoUserSession({
    IdToken: idToken,
    AccessToken: accessToken
});

describe('auth unit test', () => {
    describe('signUp', () => {
        test('happy case with string attrs', async () => {
            const spyon = jest.spyOn(CognitoUserPool.prototype, "signUp");
            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.signUp('username', 'password', 'email','phone')).toBe('signUpResult');

            spyon.mockClear();
        });

        test('happy case with object attr', async () => {
            const spyon = jest.spyOn(CognitoUserPool.prototype, "signUp");
            const auth = new Auth(authOptions);

            const attrs = {
                username: 'username',
                password: 'password',
                email: 'email',
                phone_number: 'phone_number',
                otherAttrs: 'otherAttrs'
            }
            expect.assertions(1);
            expect(await auth.signUp(attrs)).toBe('signUpResult');

            spyon.mockClear();
        });

        test('object attr with null username', async () => {
            const auth = new Auth(authOptions);

            const attrs = {
                username: null,
                password: 'password',
                email: 'email',
                phone_number: 'phone_number',
                otherAttrs: 'otherAttrs'
            }
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
                await auth.signUp('username', 'password', 'email','phone');
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
        });

        test('no user pool', async () => {
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.signUp('username', 'password', 'email','phone');
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('no username', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signUp(null, 'password', 'email','phone');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no password', async () => {
            const auth = new Auth(authOptions);

            expect.assertions(1);
            try {
                await auth.signUp('username', null, 'email','phone');
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
        test('happy case', async () => {
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

        test('no userPool', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');
            
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

        test('no password', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'authenticateUser');
            const auth = new Auth(authOptions);
            expect.assertions(1);
            try {
                await auth.signIn('username', null);
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
            expect(await auth.confirmSignIn(user, 'code')).toEqual(user);

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
                await auth.confirmSignIn(user, 'code');
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
                await auth.confirmSignIn(user, null);
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
                await auth.completeNewPassword(user, 'password', {})
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

            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
                .mockImplementationOnce(() => {
                    return user;
                });

            expect.assertions(1);
            expect(await auth.currentSession()).toBe('session');

            spyon.mockClear();
        });

        test('callback failure', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
                .mockImplementationOnce(() => {
                    return null;
                });

            expect.assertions(1);
            try {
                await auth.currentSession();
            } catch (e) {
                expect(e).toBe('No current user');
            }

            spyon.mockClear();
        });

        test('no UserPool', async () => {
            const auth = new Auth({
                userPoolId: undefined,
                userPoolWebClientId: "awsUserPoolsWebClientId",
                region: "region",
                identityPoolId: "awsCognitoIdentityPoolId"
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

            const spyon = jest.spyOn(CognitoUser.prototype, "getSession");
            const spyon2 = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
                .mockImplementationOnce(() => {
                    return user;
                });
            const spyon3 = jest.spyOn(Auth.prototype, 'currentUserPoolUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res(user);
                    });
                });

            expect.assertions(1);
            expect(await auth.currentAuthenticatedUser()).toEqual(user);
            
            spyon.mockClear();
            spyon2.mockClear();
        });

        test('happy case with source federation', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            auth['credentials_source'] = 'federated';
            auth['user'] = 'federated_user';

            expect.assertions(1);
            expect(await auth.currentAuthenticatedUser()).toBe('federated_user');
        });
    });

    describe('userSession test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "getSession");

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect.assertions(1);
            expect(await auth.userSession(user)).toBe('session');

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
        })
    });

    describe('currentUserCredentials test', () => {
        test('with federated info', async () => {
            const auth = new Auth(authOptions);
            
            const spyon = jest.spyOn(Cache, 'getItem')
                .mockImplementationOnce(() => {
                    return {
                        provider: 'google',
                        token: 'token',
                        user: {name: 'user'}
                    }
                });
                
            expect.assertions(1);
            expect(await auth.currentUserCredentials()).toBeUndefined();

            spyon.mockClear();
        });
    });

    describe('currentCrendentials', () => {
        test('happy case when auth has credentials', async () => {
            const auth = new Auth(authOptions);
            const cred = new CognitoIdentityCredentials({
                    IdentityPoolId: 'identityPoolId',
                }, {
                    region: 'region'
                });

            auth['credentials'] = cred;

            const spyon = jest.spyOn(Auth.prototype, "currentUserCredentials")
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res();
                    })
                });

            const spyon2 = jest.spyOn(CognitoIdentityCredentials.prototype, 'refresh')
                .mockImplementationOnce((callback) => {
                    callback(null);
                });

            

            expect.assertions(1);
            expect(await auth.currentCredentials()).toEqual(cred);

            spyon.mockClear();
            spyon2.mockClear();
        });
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

    describe('signOut', () => {
        test('happy case for all', async () => {
            const auth = new Auth(authOptions);
            auth['credentials'] = new CognitoIdentityCredentials({
                IdentityPoolId: 'identityPoolId'
            });
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });


            const spyon = jest.spyOn(CognitoIdentityCredentials.prototype, "clearCachedId");
            const spyon2 = jest.spyOn(Cache, 'removeItem');
            const spyon3 = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
            .mockImplementationOnce(() => {
                return user;
            });

            await auth.signOut();

            expect.assertions(2);
            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalledWith('federatedInfo');

            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
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

            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
            .mockImplementationOnce(() => {
                return user;
            });
            const spyon2 = jest.spyOn(CognitoUser.prototype, "signOut");

            await auth.signOut();

            expect.assertions(1);
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });
        
        test('no UserPool', async () => {
            const auth = new Auth(authOptionsWithNoUserPoolId);
            auth['credentials_source'] = 'aws';
            auth['credentials'] = new CognitoIdentityCredentials({
                IdentityPoolId: 'identityPoolId'
            });

            expect.assertions(1);
            try {
                await auth.signOut();
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('no User in userpool', async () => {
            const auth = new Auth(authOptions);
            auth['credentials_source'] = 'aws';
            auth['credentials'] = new CognitoIdentityCredentials({
                IdentityPoolId: 'identityPoolId'
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, 'getCurrentUser')
                .mockImplementationOnce(() => {
                    return null;
                });
            

            expect.assertions(1);
            expect(await auth.signOut()).toBeUndefined();

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
            auth['credentials_source'] = 'aws';
            auth['credentials'] = new CognitoIdentityCredentials({
                IdentityPoolId: 'identityPoolId',
                IdentityId: 'identityId'
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
                    return new Promise((res, rej)=> {
                        res({
                            email: 'email',
                            phone_number: 'phone_number'
                        });
                    });
                });

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toEqual({
                email: 'email',
                id: 'identityId',
                phone_number: 'phone_number',
                username: 'username'
            });

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('no credentials source', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            auth['credentials_source'] = null;
            

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toBeNull();
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

            expect.assertions(1);
            expect(await auth.currentUserInfo()).toBeNull();

            spyon.mockClear();
        });

        test('federated user', async () => {
            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            auth['credentials_source'] = 'federated';
            auth['user'] = 'federated_user';
       
            expect.assertions(1);
            expect(await auth.currentUserInfo()).toBe('federated_user');
        });
    });

    describe('federatedSignIn test', () => {
        test('happy case', () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(Cache, 'setItem').mockImplementationOnce(() => {
                return;
            });

            auth.federatedSignIn('google', {token: 'token', expires_at: 'expires_at'}, 'user');

            expect(spyon).toBeCalledWith('federatedInfo', {
                provider: 'google',
                token: 'token',
                user: 'user'
            },
            {
                priority: 1
            });
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
                        }])
                    });
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect(await auth.verifiedContact(user)).toEqual({
                "unverified": {"email": "email@amazon.com", "phone_number": "+12345678901"}, 
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
                        }])
                    });
                });

            const auth = new Auth(authOptions);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            expect(await auth.verifiedContact(user)).toEqual({
                "unverified": {}, 
                "verified": {"email": "email@amazon.com", "phone_number": "+12345678901"}
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
            
            expect.assertions(1);
            expect(await auth.currentUserPoolUser()).toEqual(user);

            spyon.mockClear();
            spyon2.mockClear();
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
                await auth.currentUserPoolUser()
            } catch (e) {
                expect(e).toBe('No current user in userPool');
            }

            spyon.mockClear();
        });

        test('No userPool', async () => {
            const auth = new Auth(authOptionsWithNoUserPoolId);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });
            
            expect.assertions(1);
            try {
                await auth.currentUserPoolUser()
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
            
            expect.assertions(1);
            try {
                await auth.currentUserPoolUser()
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

});
