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

const config = {
    storage,
    _keyPrefix: 'keyPrefix'
}

const refreshHandler = jest.fn();
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
        test('happy case, session is not expired', () => {
            
        });
    });
});
