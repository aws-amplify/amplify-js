import { decodeJWT } from '.';
import {
	AuthConfig,
	AuthKeys,
	AuthStorageKeys,
	AuthTokenStore,
	AuthTokens,
} from './types';
import { KeyValueStorageInterface } from '../../types';
import { AmplifyError } from '../../Errors';

export class DefaultTokenStore implements AuthTokenStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
		return;
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
		return;
	}

	async loadTokens(): Promise<AuthTokens> {
		if (this.authConfig === undefined) {
			throw new AmplifyError({
				message: 'Auth not configured',
				name: 'AuthConfigException',
				recoverySuggestion: 'Make sure to call Amplify.configure in your app',
			});
		}
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
				await this.keyValueStorage.getItem(authKeys.accessToken)
			);
			const itString = await this.keyValueStorage.getItem(authKeys.idToken);
			const idToken = itString ? decodeJWT(itString) : undefined;
			const accessTokenExpAt =
				Number.parseInt(
					await this.keyValueStorage.getItem(authKeys.accessTokenExpAt)
				) || 0;
			const metadata = JSON.parse(
				(await this.keyValueStorage.getItem(authKeys.metadata)) || '{}'
			);
			const clockDrift =
				Number.parseInt(
					await this.keyValueStorage.getItem(authKeys.clockDrift)
				) || 0;

			return {
				accessToken,
				idToken,
				accessTokenExpAt,
				metadata,
				clockDrift,
			};
		} catch (err) {
			throw new Error('No valid tokens');
		}
	}
	async storeTokens(tokens: AuthTokens): Promise<void> {
		if (this.authConfig === undefined) {
			throw new AmplifyError({
				message: 'Auth not configured',
				name: 'Auth not configure',
				recoverySuggestion:
					'Add Amplify.configure({ Auth: {...} }) to your App',
			});
		}

		if (tokens === undefined) {
			throw new AmplifyError({
				message: 'Invalid tokens',
				name: 'Invalid tokens',
				recoverySuggestion: 'Make sure the tokens are valid',
			});
		}

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
		if (this.authConfig === undefined) {
			throw new AmplifyError({
				message: 'Auth not configured',
				name: 'Auth not configure',
				recoverySuggestion:
					'Add Amplify.configure({ Auth: {...} }) to your App',
			});
		}

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
