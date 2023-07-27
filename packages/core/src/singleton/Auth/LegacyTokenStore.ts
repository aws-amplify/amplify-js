import {
	LEGACY_KEY_PREFIX,
	assertTokenProviderConfig,
	decodeJWT,
	getAuthStorageKeys,
	getUsernameFromStorage,
} from './utils';
import {
	AuthConfig,
	AuthDeviceKeys,
	AuthTokenStore,
	AuthTokens,
} from './types';
import { KeyValueStorageInterface } from '../../types';
import { LegacyAuthStorageKeys } from './types';
import { AmplifyError } from '../../Errors';

export class LegacyDefaultTokenStore implements AuthTokenStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	private async getLegacyKeys(): Promise<
		typeof LegacyAuthStorageKeys & typeof AuthDeviceKeys
	> {
		// Gets LastAuthUser key without 'username' prefix
		const clientId = this.authConfig.userPoolWebClientId;
		const lastAuthUser = `${LEGACY_KEY_PREFIX}.${clientId}.${LegacyAuthStorageKeys.lastAuthUser}`;
		const username = await getUsernameFromStorage(
			this.keyValueStorage,
			lastAuthUser
		);

		const legacyKeys = getAuthStorageKeys({
			...LegacyAuthStorageKeys,
			...AuthDeviceKeys,
		})(LEGACY_KEY_PREFIX, `${clientId}.${username}`);

		return { ...legacyKeys, lastAuthUser };
	}

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}

	async loadTokens(): Promise<AuthTokens> {
		assertTokenProviderConfig(this.authConfig);

		try {
			const legacyKeyValues = await this.getLegacyKeys();

			const clockDrift =
				Number.parseInt(
					await this.keyValueStorage.getItem(legacyKeyValues.clockDrift)
				) || 0;
			const accessToken = decodeJWT(
				await this.keyValueStorage.getItem(legacyKeyValues.accessToken)
			);
			const itString = await this.keyValueStorage.getItem(
				legacyKeyValues.idToken
			);
			const idToken = itString ? decodeJWT(itString) : undefined;
			const accessTokenExpAt = (accessToken.payload.exp || 0) * 1000;

			const deviceGroupKey = await this.keyValueStorage.getItem(
				legacyKeyValues.deviceGroupKey
			);
			const deviceKey = await this.keyValueStorage.getItem(
				legacyKeyValues.deviceKey
			);
			const randomPasswordKey = await this.keyValueStorage.getItem(
				legacyKeyValues.randomPasswordKey
			);
			const metadata = { deviceGroupKey, deviceKey, randomPasswordKey };

			return {
				accessToken,
				idToken,
				accessTokenExpAt,
				metadata,
				clockDrift,
			};
		} catch (err) {
			// TODO(v6): validate partial results with mobile implementation
			throw new Error('No valid tokens');
		}
	}
	async storeTokens(tokens: AuthTokens): Promise<void> {
		throw new AmplifyError({
			name: 'AuthTokenStorageException',
			message: 'storeTokens method is not supported',
		});
	}

	async clearTokens(): Promise<void> {
		assertTokenProviderConfig(this.authConfig);

		const legacyKeyValues = await this.getLegacyKeys();

		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.keyValueStorage.removeItem(legacyKeyValues.accessToken),
			this.keyValueStorage.removeItem(legacyKeyValues.idToken),
			this.keyValueStorage.removeItem(legacyKeyValues.refreshToken),
			this.keyValueStorage.removeItem(legacyKeyValues.clockDrift),
			this.keyValueStorage.removeItem(legacyKeyValues.lastAuthUser),
			this.keyValueStorage.removeItem(legacyKeyValues.userData),
			this.keyValueStorage.removeItem(legacyKeyValues.deviceKey),
			this.keyValueStorage.removeItem(legacyKeyValues.deviceGroupKey),
			this.keyValueStorage.removeItem(legacyKeyValues.randomPasswordKey),
		]);
	}
}
