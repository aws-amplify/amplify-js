export interface AmplifyConfig {
	Analytics?: object;
	Auth?: object;
	API?: object;
	Storage?: object;
	Cache?: object;
	ssr?: boolean;
}

export interface ICredentials {
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
	identityId: string;
	authenticated: boolean;
}

/**
 * @private
 * Internal use of Amplify only
 */

export type DelayFunction = (
	attempt: number,
	args?: any[],
	error?: Error
) => number | false;

export interface PromiseHandlers {
	resolve: Function;
	reject: Function;
}

export interface LoggingProvider {
	// you need to implement those methods

	// return 'Logging';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;
}
