import { CognitoProvider } from '../../src/Providers/CognitoProvider/CognitoProvider';
import {
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

const createMockLocalStorage = () =>
	({
		_items: {},
		getItem(key: string) {
			return this._items[key];
		},
		setItem(key: string, value: string) {
			this._items[key] = value;
		},
		clear() {
			this._items = {};
		},
		removeItem(key: string) {
			delete this._items[key];
		},
	} as unknown as Storage);

describe('Cognito Provider tests', () => {
	describe('Sign In', () => {
		afterEach(() => {
			jest.clearAllMocks();
			jest.resetAllMocks();
		});
		test('happy case - plain username & password signin', async () => {
			const mockLocalStorage = createMockLocalStorage();
			const provider = new CognitoProvider();
			provider.configure({
				userPoolId: 'userPoolId',
				region: 'us-west-1',
				clientId: 'clientId',
				identityPoolId: 'identityPoolId',
				storage: mockLocalStorage,
			});
			CognitoIdentityProviderClient.prototype.send = jest.fn(async command => {
				if (command instanceof InitiateAuthCommand) {
					return {
						AuthenticationResult: {
							AccessToken: '',
							RefreshToken: '',
							IdToken: '',
						},
					};
				}
			});
			const res = await provider.signIn({
				signInType: 'Password',
				username: 'username',
				password: 'password',
			});
			expect(res).toStrictEqual({ signInSuccesful: true, nextStep: false });
			expect(mockLocalStorage.getItem('__cognito_cached_tokens')).toEqual(
				JSON.stringify({ accessToken: '', idToken: '', refreshToken: '' })
			);
		});

		test('should throw error if provider is not configured before calling signIn', async () => {
			const provider = new CognitoProvider();
			await expect(
				provider.signIn({
					signInType: 'Password',
					username: 'username',
					password: 'password',
				})
			).rejects.toThrowError('Plugin not configured');
		});
	});
});
