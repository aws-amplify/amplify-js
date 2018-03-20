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

    CognitoUser.prototype.changePassword = (oldPassword, newPassword, callback) => {
        callback(null, 'SUCCESS');
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

    CognitoUser.prototype.updateAttributes = (attributeList, callback) {
        callback(null, 'SUCCESS');
    }

    return CognitoUser;
});

import CognitoCredentials from '../../src/Credentials/Providers/CognitoCredentials';
import { CookieStorage, CognitoUserPool, CognitoUser, CognitoUserSession, CognitoIdToken, CognitoAccessToken } from 'amazon-cognito-identity-js';
import Cache from '../../src/Cache';
import Auth from '../../src/Auth';
import { AWS } from '../../src/Common';

const {
    CognitoIdentityCredentials
} = AWS;

const config = {
    cognitoRegion: 'region',
    cognitoUserPoolId: 'cognitoUserPoolId',
    cognitoIdentityPoolId: 'cognitoIdentityPoolId',
    cognitoUserPoolWebClientId: 'cognitoUserPoolWebClientId',
    mandatorySignIn: false
}

const userPool = new CognitoUserPool({
    UserPoolId: config.cognitoUserPoolId,
    ClientId: config.cognitoUserPoolWebClientId
});

describe('CognitoCredentials unit tests', () => {
    describe('configure test', () => {
        test('happy case', () => {
            const cognitoCredentials = new CognitoCredentials();
            expect(cognitoCredentials.configure({config: 'config'})).toEqual({config: 'config'});
        });
    });

    describe('getCategory test', () => {
        test('happy case', () => {
            const cognitoCredentials = new CognitoCredentials();
            expect(cognitoCredentials.getCategory()).toBe('Credentials');
        });
    });

    describe('getProviderName test', () => {
        test('happy case', () => {
            const cognitoCredentials = new CognitoCredentials();
            expect(cognitoCredentials.getProviderName()).toBe('AWSCognito');
        });
    });

    describe('set Credentials test', () => {
        test('from session', async () => {
            const cognitoCredentials = new CognitoCredentials();
            const session = {
                getIdToken() {
                    return {
                        getJwtToken() {
                            return 'idToken';
                        }
                    }
                }
            }
            cognitoCredentials.configure(config);

            const spyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'getPromise').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res();
                });
            });

            expect(await cognitoCredentials.setCredentials({ session })).toEqual({
                "_clientConfig": {
                    "region": "region",
                },
                "_identityId": null,
                "accessKeyId": undefined,
                "authenticated": true,
                "data": null,
                "expireTime": null,
                "expired": true,
                "params": {
                    "IdentityPoolId": "cognitoIdentityPoolId",
                    "Logins": {
                    "cognito-idp.region.amazonaws.com/cognitoUserPoolId": "idToken",
                    },
                },
                "sessionToken": undefined,
            });

            spyon.mockClear();
        });

        test('for guest', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);
            const spyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'getPromise').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res();
                });
            });

            expect(await cognitoCredentials.setCredentials({ guest: true })).toEqual({
                "_clientConfig": {
                    "region": "region",
                },
                "_identityId": null,
                "accessKeyId": undefined,
                "authenticated": false,
                "data": null,
                "expireTime": null,
                "expired": true,
                "params": {
                    "IdentityPoolId": "cognitoIdentityPoolId",
                },
                "sessionToken": undefined,
            });
            spyon.mockClear();
        });

        test('for guest with mandaroty signin', async () => {
            const cognitoCredentials = new CognitoCredentials();
            const new_config = Object.assign(config, {mandatorySignIn: true});
            cognitoCredentials.configure(new_config);
            const spyon = jest.spyOn(CognitoIdentityCredentials.prototype, 'getPromise').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res();
                });
            });

            expect(await cognitoCredentials.setCredentials({ guest: true })).toBeUndefined();
            spyon.mockClear();
        });

        test('from federation', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);

            const spyon = jest.spyOn(Cache, 'setItem').mockImplementationOnce(() => {
                return;
            });

            const federated = {
                provider: 'google',
                token: 'token',
                user: 'user'
            }

            const spyon2 = jest.spyOn(CognitoIdentityCredentials.prototype, 'getPromise').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res();
                });
            });

            expect(await cognitoCredentials.setCredentials({ federated })).toEqual({
                "_clientConfig": {
                    "region": "region",
                },
                "_identityId": null,
                "accessKeyId": undefined,
                "authenticated": true,
                "data": null,
                "expireTime": null,
                "expired": true,
                "params": {
                    "IdentityPoolId": "cognitoIdentityPoolId",
                    "Logins": {
                        "accounts.google.com": "token",
                    },
                },
                "sessionToken": undefined,
            });

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('from federation with wrong provider', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);

            const spyon = jest.spyOn(Cache, 'setItem').mockImplementationOnce(() => {
                return;
            });

            const federated = {
                provider: 'other',
                token: 'token',
                user: 'user'
            }

            try {
                await cognitoCredentials.setCredentials({ federated });
            } catch (e) {
                expect(e).not.toBeNull();
            }
            
            spyon.mockClear();
        });

        test('wrong config', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);

            try {
                await cognitoCredentials.setCredentials({ wrongConfig: '' });
            } catch (e) {
                expect(e).not.toBeNull();
            }
        });
    });

    describe('removeCredentials test', () => {
        test('happy case', () => {
            const spyon = jest.spyOn(Cache, 'removeItem').mockImplementationOnce(() => {
                return;
            });

            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.removeCredentials();
        });

        test('happy case with credentials exists', () => {
            const spyon = jest.spyOn(Cache, 'removeItem').mockImplementationOnce(() => {
                return;
            });

            const cognitoCredentials = new CognitoCredentials();
            const credentials = {
                expired: false,
                clearCachedId() {
                    return;
                }
            }
            cognitoCredentials._credentials = credentials;

            cognitoCredentials.removeCredentials();
        });
    });

    describe('essentialCredentials test', () => {
        test('happy case', () => {
            const cognitoCredentials = new CognitoCredentials();
            const credentials = {
                accessKeyId: 'accessKeyId',
                sessionToken: 'sessionToken',
                secretAccessKey: 'secretAccessKey',
                identityId: 'identityId',
                authenticated: false,
                other: 'other'
            }
            expect(cognitoCredentials.essentialCredentials({credentials})).toEqual({
                accessKeyId: 'accessKeyId',
                sessionToken: 'sessionToken',
                secretAccessKey: 'secretAccessKey',
                identityId: 'identityId',
                authenticated: false
            });
        });
    });

    describe('getCredentials test', () => {
        test('credentials exists and not expired', async () => {
            const cognitoCredentials = new CognitoCredentials();
            const credentials = {
                expired: false,
                expireTime: (new Date().getTime()) * 2
            }
            cognitoCredentials._credentials = credentials;
            expect(await cognitoCredentials.getCredentials()).toEqual(credentials);
        });

        test('credentials expired and retrieve it from currentsession', async () => {
            const spyon = jest.spyOn(Cache, 'getItem').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(null);
                });
            });
            
            const session = {
                getIdToken() {
                    return {
                        getJwtToken() {
                            return 'idToken';
                        }
                    }
                }
            };

            const spyon2 = jest.spyOn(Auth, 'currentSession').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(session);
                });
            });

            const spyon3 = jest.spyOn(CognitoIdentityCredentials.prototype, "refresh").mockImplementation((callback) => {
                callback(null);
            });

            const cognitoCredentials = new CognitoCredentials();
            const credentials = {
                expired: true,
                expireTime: 0
            }
            cognitoCredentials._credentials = new CognitoIdentityCredentials();

            expect(await cognitoCredentials.getCredentials()).not.toBeNull();
            spyon.mockClear();
            spyon2.mockClear();
            spyon3.mockClear();
        });

        test('credentials not exist and retrieve it from federatedInfo', async () => {
            const federated = {
                provider: 'google',
                token: 'token',
                user: 'user'
            }
            const spyon = jest.spyOn(Cache, 'getItem').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res(federated);
                });
            });

            const spyon3 = jest.spyOn(CognitoIdentityCredentials.prototype, "refresh").mockImplementation((callback) => {
                callback(null);
            });

            const cognitoCredentials = new CognitoCredentials();

            expect(await cognitoCredentials.getCredentials()).not.toBeNull();
            spyon.mockClear();
            spyon3.mockClear();
        });

        test('credentials not exist and getItem error', async () => {
            const federated = {
                provider: 'google',
                token: 'token',
                user: 'user'
            }
            const spyon = jest.spyOn(Cache, 'getItem').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });

            const cognitoCredentials = new CognitoCredentials();

            try {
                await cognitoCredentials.getCredentials();
            } catch(e) {
                expect(e).not.toBeNull();
            }
            spyon.mockClear();
        });
    });

    describe('currentSession', () => {
        test('happy case', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);
            const user = new CognitoUser({
                Username: 'username',
                Pool: userPool
            });

            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
                .mockImplementationOnce(() => {
                    return user;
                });

            expect.assertions(1);
            expect(await cognitoCredentials.currentSession()).toBe('session');

            spyon.mockClear();
        });

        test('callback failure', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);

            const spyon = jest.spyOn(CognitoUserPool.prototype, "getCurrentUser")
                .mockImplementationOnce(() => {
                    return null;
                });

            expect.assertions(1);
            try {
                await cognitoCredentials.currentSession();
            } catch (e) {
                expect(e).toBe('No current user');
            }

            spyon.mockClear();
        });

        test('no UserPool', async () => {
            const cognitoCredentials = new CognitoCredentials();

            expect.assertions(1);
            try {
                await cognitoCredentials.currentSession();
            } catch (e) {
                expect(e).toBe('No userPool');
            }
        });
    });
});