import { StorageOptions, StorageProvider } from '../types';
/**
 * Provide storage methods to use AWS S3
 */
export default class AWSS3Provider implements StorageProvider {
	static CATEGORY: string;
	static PROVIDER_NAME: string;
	/**
	 * @private
	 */
	private _config;
	/**
	 * Initialize Storage with AWS configurations
	 * @param {Object} config - Configuration object for storage
	 */
	constructor(config?: StorageOptions);
	/**
	 * get the category of the plugin
	 */
	getCategory(): string;
	/**
	 * get provider name of the plugin
	 */
	getProviderName(): string;
	/**
	 * Configure Storage part with aws configuration
	 * @param {Object} config - Configuration of the Storage
	 * @return {Object} - Current configuration
	 */
	configure(config?: any): object;
	/**
	 * Get a presigned URL of the file or the object data when download:true
	 *
	 * @param {String} key - key of the object
	 * @param {Object} [config] - { level : private|protected|public, download: true|false }
	 * @return - A promise resolves to Amazon S3 presigned URL on success
	 */
	get(key: string, config?: any): Promise<String | Object>;
	/**
	 * Put a file in S3 bucket specified to configure method
	 * @param {String} key - key of the object
	 * @param {Object} object - File to be put in Amazon S3 bucket
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
	 * @param {Object} [config] - { level : private|protected|public }
	 * @return - Promise resolves to list of keys for all objects in path
	 */
	list(path: any, config?: any): Promise<any>;
	/**
	 * @private
	 */
	_ensureCredentials(): any;
	/**
	 * @private
	 */
	private _prefix;
	/**
	 * @private
	 */
	private _createS3;
}
