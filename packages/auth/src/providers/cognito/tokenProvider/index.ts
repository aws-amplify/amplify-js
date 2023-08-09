import {
	AuthTokens,
	KeyValueStorageInterface,
	MemoryKeyValueStorage,
} from '@aws-amplify/core';
import { DefaultTokenStore } from './TokenStore';
import { TokenOrchestrator } from './TokenOrchestrator';
import { CognitoUserPoolTokenRefresher } from '../apis/tokenRefresher';
import { CognitoUserPoolTokenProviderType } from './types';

const authTokenStore = new DefaultTokenStore();
authTokenStore.setKeyValueStorage(MemoryKeyValueStorage);
const tokenOrchestrator = new TokenOrchestrator();
tokenOrchestrator.setAuthTokenStore(authTokenStore);
tokenOrchestrator.setTokenRefresher(CognitoUserPoolTokenRefresher);

export const CognitoUserPoolsTokenProvider: CognitoUserPoolTokenProviderType = {
	getTokens: ({
		forceRefresh,
	}: {
		forceRefresh?: boolean;
	} = {}): Promise<AuthTokens> => {
		return tokenOrchestrator.getTokens({ forceRefresh });
	},
	setKeyValueStorage: (keyValueStorage: KeyValueStorageInterface): void => {
		authTokenStore.setKeyValueStorage(keyValueStorage);
	},
};

export { tokenOrchestrator };
