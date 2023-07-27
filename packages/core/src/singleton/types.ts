import { AuthConfig, LibraryAuthOptions } from './Auth/types';
import { I18nOptions } from '../I18n/types';

export type ResourcesConfig = {
	API?: {};
	Analytics?: {};
	Auth?: AuthConfig;
	DataStore?: {};
	I18n?: I18nOptions;
	Interactions?: {};
	Notifications?: {};
	Predictions?: {};
	Storage?: {};
};

export type LibraryOptions = {
	Auth?: LibraryAuthOptions;
};
