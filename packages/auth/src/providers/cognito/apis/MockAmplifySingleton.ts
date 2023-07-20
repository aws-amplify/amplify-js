import { StorageAdapter } from './MockStorageAdapter';
import { RefreshMetaData } from './tokenRrefreshHandler';
import {
	AuthTokens,
	AuthTokensProvider,
	defaultAuthTokensProvider,
} from './tokensProvider';
import { AuthCredentialsProvider } from '@aws-amplify/core';
class AmplifyClass {
	private _authTokensProvider: AuthTokensProvider = defaultAuthTokensProvider;

	private _authCredentialsProvider!: AuthCredentialsProvider;
	private _refreshAuthTokensHandler!: (
		refreshMetaData: RefreshMetaData
	) => Promise<AuthTokens>;

	storageAdapter!: StorageAdapter;

	get refreshAuthTokensHandler(): (
		refreshMetaData: RefreshMetaData
	) => Promise<AuthTokens> {
		return this._refreshAuthTokensHandler;
	}
	get authTokensProvider(): AuthTokensProvider {
		return this._authTokensProvider;
	}
	get authCredentialsProvider(): AuthCredentialsProvider {
		return this._authCredentialsProvider;
	}

	config = {
		identityPoolId: '',
		region: '',
		identityPoolRegion: '',
		userPoolId: '',
		isMandatorySignInEnabled: false,
	};
	configure(config: {
		Auth: {
			refreshAuthTokensHandler: (
				refreshMetaData: RefreshMetaData
			) => Promise<AuthTokens>;
			credendtialsProvider: AuthCredentialsProvider;
			storageAdapter: StorageAdapter;
		};
	}) {
		this._refreshAuthTokensHandler = config.Auth.refreshAuthTokensHandler;
		this._authCredentialsProvider = config.Auth.credendtialsProvider;
		this.storageAdapter = config.Auth.storageAdapter;
		// this.config = config;
	}
}

// Provided during config to Amplify.configure()
export const Amplify = new AmplifyClass();
