import { 
    CognitoUser, 
    CognitoUserPool, 
    CognitoUserSession
} from 'amazon-cognito-identity-js';
import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';
import AWSCognitoProvider from '../../src/providers/AWSCognitoProvider';

const config = {
    userPoolId: 'us-east-1_userPoolId',
    userPoolWebClientId: 'userPoolWebClientId'
};

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
    provider: AWSCognitoProvider.NAME,
    identityId: 'identityId',
    refreshHandler,
    errorHandler,
    credentialsDomian: 'credentialsDomain'
};

describe('AWSCognitoProvier test', () => {
    describe('getProviderName test', () => {
        test('happy case', () => {
            const provider = new AWSCognitoProvider();

            expect(provider.getProviderName()).toBe(AWSCognitoProvider.NAME);
        });
    });

    describe('getCategory test', () => {
        test('happy case', () => {
            const provider = new AWSCognitoProvider();

            expect(provider.getCategory()).toBe('Auth');
        });
    });

    describe('setSession test', () => {
        test('happy case', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'setSignInUserSession').mockImplementationOnce(() => {
                return;
            });
            const spyon2 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.resolve('credentials');
            });

            const provider = new AWSCognitoProvider(config);

            await provider.setSession(session);

            expect(spyon).toBeCalledWith({
                "accessToken":{
                    "jwtToken":"accessToken",
                    "payload":{

                    }
                },
                "clockDrift":NaN,
                "idToken":{
                    "jwtToken":"idToken",
                    "payload":{

                    }
                },
                "refreshToken":{
                    "token":"refreshToken"
                }
            });
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('errorHandler triggered when setting credentials failed', async () => {
            const spyon = jest.spyOn(CognitoUser.prototype, 'setSignInUserSession').mockImplementationOnce(() => {
                return;
            });
            const spyon2 = jest.spyOn(Credentials, 'set').mockImplementationOnce(() => {
                return Promise.reject('err');
            });

            const provider = new AWSCognitoProvider(config);

            await provider.setSession(session);

            expect(spyon).toBeCalled();
            expect(spyon2).toBeCalled();
            expect(errorHandler).toBeCalledWith('err');

            spyon.mockClear();
            spyon2.mockClear();
        });
    });
});
