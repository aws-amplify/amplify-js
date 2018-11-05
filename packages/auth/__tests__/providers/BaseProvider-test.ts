import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';
import BaseProvider from '../../src/providers/BaseProvider';

const storage = {
    getItem(key) {
        return;
    },
    setItem(key, val) {
        return;
    },
    removeItem(key) {
        return;
    }
};

const refreshHandler = jest.fn();

const config = {
    storage,
    _keyPrefix: 'keyPrefix',
    refreshHandlers: {
        'Base': refreshHandler
    }
}

const errorHandler = jest.fn();

const session = {
    username: 'username',
    attributes: {
        email: 'username@example.com',
        phone_number: '123-456-7890'
    },
    tokens: {
        idToken: 'idToken',
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expires_at: 123456
    },
    provider: 'Base',
    identityId: 'identityId',
    refreshHandler,
    errorHandler,
    credentialsDomain: 'credentialsDomain'
};

const currentTime = 20;
jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime);

describe('AWSCognitoProvier test', () => {
    describe('getProviderName test', () => {
        test('happy case', () => {
            const provider = new BaseProvider();

            expect(provider.getProviderName()).toBe('Base');
        });
    });

    describe('getCategory test', () => {
        test('happy case', () => {
            const provider = new BaseProvider();

            expect(provider.getCategory()).toBe('Auth');
        });
    });

    describe('setSession test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(storage, 'setItem');

            const spyon2 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.resolve({
                    identityId: '123456'
                });
            });

            const provider = new BaseProvider(config);

            expect(await provider.setSession(session)).toEqual({
                "credentials":{
                    "identityId": '123456'
                },
                "session":{
                    "accessToken":"accessToken",
                    "credentialsDomain":"credentialsDomain",
                    "credentialsToken":"idToken",
                    "expires_at":123456,
                    "idToken":"idToken",
                    "identityId":"identityId",
                    "provider":"Base",
                    "refreshToken":"refreshToken",
                    "type":"FederatedProviderSession"
                },
                "user":{
                    "attributes":{
                        "email":"username@example.com",
                        "phone_number":"123-456-7890"
                    },
                    "id":'123456',
                    "name":"username"
                }
            });

            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('errorHandler triggered when setting credentials failed', async () => {
            const spyon = jest.spyOn(storage, 'setItem');

            const spyon2 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            const provider = new BaseProvider(config);

            await provider.setSession(session);

            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalled();
            expect(errorHandler).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });
    });

    describe('getSession test', () => {
        test('happy case, session is not expired', async () => {
            const spyon = jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
                return JSON.stringify({
                    expires_at: currentTime * 2, 
                    idToken: 'idToken'
                });
            });

            const provider = new BaseProvider(config);

            expect(await provider.getSession()).toEqual({
                expires_at: currentTime * 2,
                idToken: 'idToken'
            });
            spyon.mockClear();
        });

        test('throw error is session is no cached', async () => {
            const spyon = jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
                return null;
            });

            const provider = new BaseProvider(config);

            expect.assertions(1);
            try {
                await provider.getSession();
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });

        test('when session is expired', async () => {
            const spyon = jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
                return JSON.stringify({
                    expires_at: currentTime / 2, 
                    idToken: 'idToken'
                });
            });

            refreshHandler.mockImplementationOnce(() => {
                return Promise.resolve({
                    token: 'new_token',
                    expires_at: currentTime * 2
                });
            })

            const provider = new BaseProvider(config);

            expect(await provider.getSession()).toEqual({
                expires_at: currentTime * 2,
                idToken: 'new_token',
                credentialsToken: 'new_token'
            });

            expect(refreshHandler).toBeCalled();

            spyon.mockClear();
        });

        test('when session is expired and refreshing failed', async () => {
            const spyon = jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
                return JSON.stringify({
                    expires_at: currentTime / 2, 
                    idToken: 'idToken'
                });
            });

            refreshHandler.mockImplementationOnce(() => {
                return Promise.reject('err');
            })

            const provider = new BaseProvider(config);

            expect.assertions(1);
            try {
                await provider.getSession();
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });

        test('when session is expired but no provider', async () => {
            const spyon = jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
                return JSON.stringify({
                    expires_at: currentTime / 2, 
                    idToken: 'idToken'
                });
            });

            const { refreshHandlers, ...new_config } = config;

            const provider = new BaseProvider(new_config);

            expect.assertions(1);
            try {
                await provider.getSession();
            } catch (e) {
                expect(e).not.toBeNull();
            }

            spyon.mockClear();
        });
    });

    describe('clear Session test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(storage, 'removeItem');

            const provider = new BaseProvider(config);
            await provider.clearSession();

            expect(spyon.mock.calls[0][0]).toBe("keyPrefix_session");
            expect(spyon.mock.calls[1][0]).toBe("keyPrefix_user");
            spyon.mockClear();
        });
    });

    describe('get user test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
                return JSON.stringify('user');
            });

            const provider = new BaseProvider(config);
            await provider.getUser();

            expect(spyon).toBeCalledWith("keyPrefix_user");
            spyon.mockClear();
        });
    });
});
