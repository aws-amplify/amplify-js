import {
	AmplifyV6,
	KeyValueStorageInterface,
	assertTokenProviderConfig,
	asserts,
	decodeJWT,
} from '@aws-amplify/core';
import {
	AuthKeys,
	AuthTokenStorageKeys,
	AuthTokenStore,
	CognitoAuthTokens,
} from './types';

export class DefaultTokenStore implements AuthTokenStore {
	constructor() {}
	keyValueStorage: KeyValueStorageInterface;

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
		return;
	}

	async loadTokens(): Promise<CognitoAuthTokens | null> {
		const authConfig = AmplifyV6.getConfig().Auth;
		assertTokenProviderConfig(authConfig);

		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format

		// Reading V6 tokens
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				authConfig.userPoolWebClientId
			);

			const accessTokenString = await this.keyValueStorage.getItem(
				authKeys.accessToken
			);

			if (!accessTokenString) {
				throw new Error('No session');
			}

			const accessToken = decodeJWT(accessTokenString);
			const itString = await this.keyValueStorage.getItem(authKeys.idToken);
			const idToken = itString ? decodeJWT(itString) : undefined;

			const refreshToken = await this.keyValueStorage.getItem(
				authKeys.refreshToken
			);
			const NewDeviceMetadata = await this.keyValueStorage.getItem(
				authKeys.NewDeviceMetadata
			);

			const clockDriftString =
				(await this.keyValueStorage.getItem(authKeys.clockDrift)) || '0';
			const clockDrift = Number.parseInt(clockDriftString);

			return {
				accessToken,
				idToken,
				refreshToken,
				NewDeviceMetadata,
				clockDrift,
			};
		} catch (err) {
			return null;
		}
	}
	async storeTokens(tokens: CognitoAuthTokens): Promise<void> {
		const authConfig = AmplifyV6.getConfig().Auth;
		assertTokenProviderConfig(authConfig);
		asserts(!(tokens === undefined), {
			message: 'Invalid tokens',
			name: 'InvalidAuthTokens',
			recoverySuggestion: 'Make sure the tokens are valid',
		});

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			authConfig.userPoolWebClientId
		);

		this.keyValueStorage.setItem(
			authKeys.accessToken,
			tokens.accessToken.toString()
		);

		if (!!tokens.idToken) {
			this.keyValueStorage.setItem(authKeys.idToken, tokens.idToken.toString());
		}

		if (!!tokens.refreshToken) {
			this.keyValueStorage.setItem(authKeys.refreshToken, tokens.refreshToken);
		}

		if (!!tokens.NewDeviceMetadata) {
			this.keyValueStorage.setItem(
				authKeys.NewDeviceMetadata,
				tokens.NewDeviceMetadata
			);
		}

		this.keyValueStorage.setItem(authKeys.clockDrift, `${tokens.clockDrift}`);
	}

	async clearTokens(): Promise<void> {
		const authConfig = AmplifyV6.getConfig().Auth;
		assertTokenProviderConfig(authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			authConfig.userPoolWebClientId
		);

		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.keyValueStorage.removeItem(authKeys.accessToken),
			this.keyValueStorage.removeItem(authKeys.idToken),
			this.keyValueStorage.removeItem(authKeys.clockDrift),
			this.keyValueStorage.removeItem(authKeys.refreshToken),
			this.keyValueStorage.removeItem(authKeys.NewDeviceMetadata),
		]);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(AuthTokenStorageKeys)(
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
