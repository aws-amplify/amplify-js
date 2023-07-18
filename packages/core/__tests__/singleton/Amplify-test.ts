import { Amplify } from '../../src/singleton';
import '@types/jest';

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

describe('Amplify config test', () => {
    test('Happy path Set and Get config', () => {
        expect.assertions(1);
        const config: ArgumentTypes<typeof Amplify.configure>[0] = {
            Auth: {
                userPoolId: 'us-east-1:aaaaaaa',
                identityPoolId: 'us-east-1:bbbbb',
                userPoolWebClientId: 'aaaaaaaaaaaa'
            }
        };

        Amplify.configure(config);
        const result = Amplify.getConfig();

        expect(result).toEqual(config);
    });

    test('Incremental set and get config', () => {
        expect.assertions(1);
        const config1: ArgumentTypes<typeof Amplify.configure>[0] = {
            Auth: {
                userPoolId: 'us-east-1:aaaaaaa',
                userPoolWebClientId: 'aaaaaaaaaaaa'
            }
        };

        Amplify.configure(config1);
        
        const config2: ArgumentTypes<typeof Amplify.configure>[0] = {
            Auth: {
                identityPoolId: 'us-east-1:bbbbb'
            }
        };
        Amplify.configure(config2);

        const result = Amplify.getConfig();

        expect(result).toEqual({
            Auth: {
                userPoolId: 'us-east-1:aaaaaaa',
                identityPoolId: 'us-east-1:bbbbb',
                userPoolWebClientId: 'aaaaaaaaaaaa'
            }
        });
    })
});

// TODO: add test get,set Tokens
describe('Session tests', () => {
    test('fetch empty session', async () => {
        const config: ArgumentTypes<typeof Amplify.configure>[0] = {
            Auth: {
                userPoolId: 'us-east-1:aaaaaaa',
                identityPoolId: 'us-east-1:bbbbb',
                userPoolWebClientId: 'aaaaaaaaaaaa'
            }
        };

        Amplify.configure(config);

        const session = await Amplify.Auth.fetchAuthSession();
        // session.
    });

    test('fetch user after signIn', async () => {
        const config: ArgumentTypes<typeof Amplify.configure>[0] = {
            Auth: {
                userPoolId: 'us-east-1:aaaaaaa',
                identityPoolId: 'us-east-1:bbbbb',
                userPoolWebClientId: 'aaaaaaaaaaaa'
            }
        };

        Amplify.configure(config);
        const mockTokens = {
            accessToken: {
                payload: {}
            },
            oidcProvider: 'COGNITO', // for logins map
            accessTokenExpAt: 0
        };
        function signIn() {
            Amplify.Auth.setTokens({
                accessToken: {
                    payload: {}
                },
                oidcProvider: 'COGNITO', // for logins map
                accessTokenExpAt: 0
            });
        }

        signIn();

        const session = await Amplify.Auth.fetchAuthSession();

        expect(session.tokens).toBe(mockTokens)
    })
});
// TODO: add test listen session