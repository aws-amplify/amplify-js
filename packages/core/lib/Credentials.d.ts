import { ICredentials } from './types';
export declare class Credentials {
	private _config;
	private _credentials;
	private _credentials_source;
	private _gettingCredPromise;
	private _refreshHandlers;
	private _storage;
	private _storageSync;
	constructor(config: any);
	getCredSource(): any;
	configure(config: any): any;
	get(): any;
	private _pickupCredentials;
	private _keepAlive;
	refreshFederatedToken(federatedInfo: any): any;
	private _isExpired;
	private _setCredentialsForGuest;
	private _setCredentialsFromAWS;
	private _setCredentialsFromFederation;
	private _setCredentialsFromSession;
	private _loadCredentials;
	set(params: any, source: any): Promise<ICredentials>;
	clear(): Promise<void>;
	/**
	 * Compact version of credentials
	 * @param {Object} credentials
	 * @return {Object} - Credentials
	 */
	shear(
		credentials: any
	): {
		accessKeyId: any;
		sessionToken: any;
		secretAccessKey: any;
		identityId: any;
		authenticated: any;
	};
}
declare const instance: Credentials;
export default instance;
