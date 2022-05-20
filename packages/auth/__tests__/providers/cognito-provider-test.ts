import { CognitoProvider } from '../../src/Providers/CognitoProvider/CognitoProvider';
import { CognitoService } from '../../src/Providers/CognitoProvider/serviceClass';

function createMockLocalStorage(): Storage {
	let items: { [key: string]: any } = {};
	return {
		getItem: (key: string) => items[key],
		removeItem: (key: string) => {
			delete items[key];
		},
		setItem: (key: string, value: any) => {
			items[key] = value;
		},
		clear: () => {
			items = {};
		},
		length: Object.keys(items).length,
		key: () => {
			throw new Error('not implemented');
		},
	};
}

describe('Cognito Provider tests', () => {
	describe('Sign In', () => {
		afterEach(() => {
			jest.clearAllMocks();
			jest.resetAllMocks();
		});
		test('happy case - plain username & password signin', async () => {
			jest.spyOn(CognitoService.prototype, 'signIn').mockResolvedValueOnce({
				$metadata: {},
				AuthenticationResult: {
					AccessToken: 'accessToken',
					RefreshToken: 'refreshToken',
					IdToken: 'idToken',
				},
				Session: null,
			});

			jest
				.spyOn(CognitoService.prototype, 'fetchSession')
				.mockResolvedValueOnce(null);
			const mockLocalStorage = createMockLocalStorage();
			const provider = new CognitoProvider({
				region: 'us-west-1',
				clientId: 'clientId',
				identityPoolId: 'identityPoolId',
				userPoolId: 'userPoolId',
			});
			provider.configure({
				userPoolId: 'userPoolId',
				region: 'us-west-1',
				clientId: 'clientId',
				identityPoolId: 'identityPoolId',
				storage: mockLocalStorage,
			});
			const res = await provider.signIn({
				signInType: 'Password',
				username: 'username',
				password: 'password',
			});
			expect(res).toStrictEqual({ signInSuccesful: true, nextStep: false });
			expect(mockLocalStorage.getItem('__cognito_cached_tokens')).toEqual(
				JSON.stringify({
					accessToken: 'accessToken',
					idToken: 'idToken',
					refreshToken: 'refreshToken',
				})
			);
		});

		test('should throw error if provider is not configured before calling signIn', async () => {
			const provider = new CognitoProvider({});
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
