jest.mock('aws-sdk-mobile-analytics', () => {
    const Manager = () => {}

    Manager.prototype.recordEvent = () => {

    }

    Manager.prototype.recordMonetizationEvent = () => {

    }

    var ret =  {
        Manager: Manager
    }
    return ret;
});

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

    return CognitoUser;
});

import { AuthOptions, SignUpParams } from '../../src/Auth/types';
import Auth from '../../src/Auth/Auth';
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

const user = new CognitoUser({
    Username: 'username',
    Pool: userPool
});

const idToken = new CognitoIdToken({IdToken: 'idToken'});
const accessToken = new CognitoAccessToken({AccessToken: 'accessToken'});

const session = new CognitoUserSession({
    IdToken: idToken,
    AccessToken: accessToken
});

describe('auth unit test', () => {
    describe('signUp', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUserPool.prototype, "signUp");
            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.signUp('username', 'password', 'email','phone')).toBe('signUpResult');

            spyon.mockClear();
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
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.signUp(null, 'password', 'email','phone');
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });

        test('no password', async () => {
            const auth = new Auth(authOptionsWithNoUserPoolId);

            expect.assertions(1);
            try {
                await auth.signUp('username', null, 'email','phone');
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

            expect.assertions(1);
            try {
                await auth.confirmSignIn(user, null);
            } catch (e) {
                expect(e).not.toBeNull();
            }
        
            spyon.mockClear();
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
        test('happy case', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(CognitoUser.prototype, "getSession");
            const spyon2 = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
                .mockImplementationOnce(() => {
                    return user;
                });

            expect.assertions(1);
            expect(await auth.currentAuthenticatedUser()).toEqual(user);
            
            spyon.mockClear();
            spyon2.mockClear();
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
                await auth.currentAuthenticatedUser();
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });
    });

    describe('userSession', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "getSession");

            const auth = new Auth(authOptions);

            expect.assertions(1);
            expect(await auth.userSession(user)).toBe('session');

            spyon.mockClear();
        });

        test('callback error', async () => {
            const auth = new Auth(authOptions);
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


    describe('verifyUserAttributes', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, "getAttributeVerificationCode");

            const auth = new Auth(authOptions);

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

            expect.assertions(1);
            try {
                await auth.verifyUserAttributeSubmit(user, {}, 'code');
            } catch (e) {
                expect(e).toBe("err");
            }
        
            spyon.mockClear();
        });
    });

    describe('signOut', () => {
        test('happy case with source userpool', async () => {
            const auth = new Auth(authOptions);
            auth['credentials_source'] = 'aws';

            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
            .mockImplementationOnce(() => {
                return user;
            });
            const spyon2 = jest.spyOn(CognitoUser.prototype, "signOut");

            await auth.signOut();

            expect.assertions(1);
            expect(spyon2).toBeCalled();

            spyon2.mockClear();
            spyon.mockClear();
        });
        
        test('no UserPool', async () => {
            const auth = new Auth(authOptionsWithNoUserPoolId);
            auth['credentials_source'] = 'aws';

            expect.assertions(1);
            try {
                await auth.signOut();
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });

        test('no User', async () => {
            const auth = new Auth(authOptions);

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

            expect(await auth.verifiedContact(user)).toEqual({
                "unverified": {}, 
                "verified": {"email": "email@amazon.com", "phone_number": "+12345678901"}
            });

            spyon.mockClear();
        });
    });

});