import { CookieStorage } from 'amazon-cognito-identity-js';
import { Logger, UniversalStorage, StorageHelper } from '@aws-amplify/core';
import { AuthOptions } from '../types';

const logger = new Logger('AuthStorageUtils');

/**
 * @private
 * Internal use of Amplify only
 */
export function getAuthStorage(config: AuthOptions) {
	let storage;
	if (!config.storage) {
		// backwards compatibility
		if (config.cookieStorage) storage = new CookieStorage(config.cookieStorage);
		else {
			storage = config.ssr
				? new UniversalStorage()
				: new StorageHelper().getStorage();
		}
	} else {
		if (!isValidAuthStorage(config.storage)) {
			logger.error('The storage in the Auth config is not valid!');
			throw new Error('Empty storage object');
		}
		storage = config.storage;
	}
	return storage;
}

function isValidAuthStorage(obj) {
	// We need to check if the obj has the functions of Storage
	return (
		!!obj &&
		typeof obj.getItem === 'function' &&
		typeof obj.setItem === 'function' &&
		typeof obj.removeItem === 'function' &&
		typeof obj.clear === 'function'
	);
}
