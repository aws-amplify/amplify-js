import {
	assertTokenProviderConfig,
	assertsKeyValueStorage,
	decodeJWT,
} from './utils';
import {
	AuthConfig,
	AuthKeys,
	AuthStorageKeys,
	AuthTokenStore,
	AuthTokens,
} from './types';
import { KeyValueStorageInterface } from '../../types';
import { asserts } from '../../Util/errors/AssertError';
import { AmplifyError } from '../../Errors';

export class DefaultTokenStore implements AuthTokenStore {
	keyValueStorage?: KeyValueStorageInterface;
	authConfig?: AuthConfig;

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
		return;
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
		return;
	}

	async loadTokens(): Promise<AuthTokens> {
		assertTokenProviderConfig(this.authConfig);
		assertsKeyValueStorage(this.keyValueStorage);

		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format

		// Reading V6 tokens
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				this.authConfig.userPoolWebClientId
			);

			const accessToken = decodeJWT(
				(await this.keyValueStorage.getItem(authKeys.accessToken)) as string
			);
			const itString = await this.keyValueStorage.getItem(authKeys.idToken);
			const idToken = itString ? decodeJWT(itString) : undefined;
			const accessTokenExpAt =
				Number.parseInt(
					(await this.keyValueStorage.getItem(
						authKeys.accessTokenExpAt
					)) as string
				) || 0;
			const metadata = JSON.parse(
				(await this.keyValueStorage.getItem(authKeys.metadata)) || '{}'
			);
			const clockDrift =
				Number.parseInt(
					(await this.keyValueStorage.getItem(authKeys.clockDrift)) as string
				) || 0;

			return {
				accessToken,
				idToken,
				accessTokenExpAt,
				metadata,
				clockDrift,
			};
		} catch (err) {
			// TODO(v6): validate partial results with mobile implementation

			throw new AmplifyError({
				name: 'InvalidTokenException',
				message: 'Invalid tokens in storage',
				underlyingError: err,
			});
		}
	}
	async storeTokens(tokens: AuthTokens): Promise<void> {
		assertTokenProviderConfig(this.authConfig);
		asserts(!(tokens === undefined), {
			message: 'Invalid tokens',
			name: 'InvalidAuthTokens',
			recoverySuggestion: 'Make sure the tokens are valid',
		});
		assertsKeyValueStorage(this.keyValueStorage);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		this.keyValueStorage.setItem(
			authKeys.accessToken,
			tokens.accessToken.toString()
		);

		if (!!tokens.idToken) {
			this.keyValueStorage.setItem(authKeys.idToken, tokens.idToken.toString());
		}

		this.keyValueStorage.setItem(
			authKeys.accessTokenExpAt,
			`${tokens.accessTokenExpAt}`
		);

		this.keyValueStorage.setItem(
			authKeys.metadata,
			JSON.stringify(tokens.metadata)
		);

		this.keyValueStorage.setItem(authKeys.clockDrift, `${tokens.clockDrift}`);
	}

	async clearTokens(): Promise<void> {
		assertTokenProviderConfig(this.authConfig);
		assertsKeyValueStorage(this.keyValueStorage);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.keyValueStorage.removeItem(authKeys.accessToken),
			this.keyValueStorage.removeItem(authKeys.idToken),
			this.keyValueStorage.removeItem(authKeys.accessTokenExpAt),
			this.keyValueStorage.removeItem(authKeys.clockDrift),
			this.keyValueStorage.removeItem(authKeys.metadata),
		]);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(AuthStorageKeys)(
		`com.amplify.${provider}`,
		identifier
	);
};

export function getAuthStorageKeys<T extends Record<string, string>>(
	authKeys: T
) {
	const keys = Object.values({ ...authKeys });
	return (prefix: string, identifier: string) =>
		keys.reduce(
			(acc, authKey) => ({
				...acc,
				[authKey]: `${prefix}.${identifier}.${authKey}`,
			}),
			{} as AuthKeys<keyof T & string>
		);
}
