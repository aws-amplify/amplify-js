import { Amplify } from './MockAmplifySingleton';
import { RefreshMetaData } from './tokenRrefreshHandler';

export type GetAuthTokensOptions = {
	forceRefresh?: boolean;
};

export type OidcProvider = 'COGNITO' | { custom: string };

export type AuthTokens = OIDCAuthTokens & {
	oidcProvider: OidcProvider;
	refreshMetaData: RefreshMetaData;
	isSignedIn: boolean;
};

type OIDCAuthTokens = {
	idToken: string;
	accessToken: string;
	accessTokenExpiresAt: number; // Calucated from either the response expires_in or accessToken claims exp
};

export interface AuthTokensProvider {
	getAuthTokens: (options?: GetAuthTokensOptions) => Promise<AuthTokens>;
	setAuthTokens: (authTokens: AuthTokens) => Promise<void>;
}

export const defaultAuthTokensProvider: AuthTokensProvider = {
	async getAuthTokens(options?: GetAuthTokensOptions): Promise<AuthTokens> {
		var tokens = Amplify.storageAdapter.get();
		// NOTE: expires_in needs to be calculated with tokens claims
		if (10 > tokens.accessTokenExpiresAt) {
			// If refreshMetadata is not in the Auth storage, ask the tokenRefreshClient to get it

			tokens = await Amplify.refreshAuthTokensHandler(tokens.refreshMetaData);

			// store the refresdtokens in local storage
			Amplify.storageAdapter.set(tokens);
		}
		return tokens;
	},
	async setAuthTokens(authTokens: AuthTokens): Promise<void> {
		// Store AuthTokens and refreshMetadata in storage
		Amplify.storageAdapter.set(authTokens);
		return Promise.resolve();
	},
};
