import { AuthConfig, LibraryAuthOptions, UserPoolConfig } from './Auth/types';

export type ResourcesConfig = {
	API?: {};
	Analytics?: {};
	Auth?: AuthConfig;
	DataStore?: {};
	Interactions?: {};
	Notifications?: {};
	Predictions?: {};
	Storage?: {};
};

export type LibraryOptions = {
	Auth?: LibraryAuthOptions;
};

export { AuthConfig, UserPoolConfig };
