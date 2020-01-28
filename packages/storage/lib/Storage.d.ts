import { StorageProvider } from './types';
/**
 * Provide storage methods to use AWS S3
 */
export default class StorageClass {
	/**
	 * @private
	 */
	private _config;
	private _pluggables;
	/**
	 * @public
	 */
	vault: StorageClass;
	/**
	 * Initialize Storage
	 * @param {Object} config - Configuration object for storage
	 */
	constructor();
	getModuleName(): string;
	/**
	 * add plugin into Storage category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	addPluggable(pluggable: StorageProvider): {};
	/**
	 * Get the plugin object
	 * @param providerName - the name of the plugin
	 */
	getPluggable(providerName: string): StorageProvider;
	/**
	 * Remove the plugin object
	 * @param providerName - the name of the plugin
	 */
	removePluggable(providerName: string): void;
	/**
	 * Configure Storage
	 * @param {Object} config - Configuration object for storage
	 * @return {Object} - Current configuration
	 */
	configure(config?: any): any;
	/**
	 * Get a presigned URL of the file or the object data when download:true
	 *
	 * @param {String} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public, download: true|false }
	 * @return - A promise resolves to either a presigned url or the object
	 */
	get(key: string, config?: any): Promise<String | Object>;
	/**
	 * Put a file in storage bucket specified to configure method
	 * @param {String} key - key of the object
	 * @param {Object} object - File to be put in bucket
	 * @param {Object} [config] - { level : private|protected|public, contentType: MIME Types,
	 *  progressCallback: function }
	 * @return - promise resolves to object on success
	 */
	put(key: string, object: any, config?: any): Promise<Object>;
	/**
	 * Remove the object for specified key
	 * @param {String} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public }
	 * @return - Promise resolves upon successful removal of the object
	 */
	remove(key: string, config?: any): Promise<any>;
	/**
	 * List bucket objects relative to the level and prefix specified
	 * @param {String} path - the path that contains objects
	 * @param {Object} [config] - { level : private|protected|public, maxKeys: NUMBER }
	 * @return - Promise resolves to list of keys for all objects in path
	 */
	list(path: any, config?: any): Promise<any>;
}
