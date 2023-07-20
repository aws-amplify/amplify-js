import { Amplify } from '../../src/singleton';
import { decodeJWT } from '../../src/singleton/Auth';

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
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
        const mockToken = decodeJWT(token);
        function signIn() {
            Amplify.Auth.setTokens({
                accessToken: mockToken,
                accessTokenExpAt: 2000000000000,
            });
        }

        signIn();

        const session = await Amplify.Auth.fetchAuthSession();

        expect(session.tokens?.accessToken.payload).toEqual({
            "exp": 1710293130,
            "iat": 1516239022,
            "name": "John Doe",
            "sub": "1234567890"
        });

        expect(session.tokens?.accessTokenExpAt).toBe(2000000000000);
    })
});
// TODO: add test listen session