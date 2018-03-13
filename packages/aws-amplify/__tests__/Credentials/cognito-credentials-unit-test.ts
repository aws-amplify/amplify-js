jest.mock('../../src/Credentials', () => {
    const Credentials = {
        getCredentials(params) {
            return new Promise((res, rej) => {
                res({
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                });
            });
        },
        setCredentials(params) {
            return null;
        },
        removeCredentials(params) {
            return null;
        },
        essentialCredentials(params) {
            return 'cred';
        }
    };

    return {
        default: Credentials        
    }
});

import CognitoCredentials from '../../src/Credentials/Providers/CognitoCredentials';
import Cache from '../../src/Cache';
import Auth from '../../src/Auth';
import { AWS } from '../../src/Common';

const {
    CognitoIdentityCredentials
} = AWS;

const config = {
    cognitoRegion: 'region',
    cognitoUserPoolId: 'cognitoUserPoolId',
    cognitoIdentityPoolId: 'cognitoIdentityPoolId'
}

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
        });

        test('for guest', async () => {
            const cognitoCredentials = new CognitoCredentials();
            cognitoCredentials.configure(config);
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
                    "IdentityId": null,
                    "IdentityPoolId": "cognitoIdentityPoolId",
                },
                "sessionToken": undefined,
            });
        });

        test('for guest with mandaroty signin', async () => {
            const cognitoCredentials = new CognitoCredentials();
            const new_config = Object.assign(config, {mandatorySignIn: true});
            cognitoCredentials.configure(new_config);
            expect(await cognitoCredentials.setCredentials({ guest: true })).toBeUndefined();
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

            expect(await cognitoCredentials.getCredentials()).toBeNull();
            spyon.mockClear();
        });
    });
});