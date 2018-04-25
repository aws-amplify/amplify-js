import { StorageOptions } from './types';
/**
 * Provide storage methods to use AWS S3
 */
export default class StorageClass {
    /**
     * @private
     */
    private _options;
    /**
     * @public
     */
    vault: StorageClass;
    /**
     * Initialize Storage with AWS configurations
     * @param {Object} options - Configuration object for storage
     */
    constructor(options: StorageOptions);
    /**
     * Configure Storage part with aws configuration
     * @param {Object} config - Configuration of the Storage
     * @return {Object} - Current configuration
     */
    configure(options?: any): any;
    /**
    * Get a presigned URL of the file
    * @param {String} key - key of the object
    * @param {Object} [options] - { level : private|protected|public }
    * @return - A promise resolves to Amazon S3 presigned URL on success
    */
    get(key: string, options?: any): Promise<Object>;
    /**
     * Put a file in S3 bucket specified to configure method
     * @param {Stirng} key - key of the object
     * @param {Object} object - File to be put in Amazon S3 bucket
     * @param {Object} [options] - { level : private|protected|public, contentType: MIME Types }
     * @return - promise resolves to object on success
     */
    put(key: string, object: any, options?: any): Promise<Object>;
    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [options] - { level : private|protected|public }
     * @return - Promise resolves upon successful removal of the object
     */
    remove(key: string, options?: any): Promise<any>;
    /**
     * List bucket objects relative to the level and prefix specified
     * @param {String} path - the path that contains objects
     * @param {Object} [options] - { level : private|protected|public }
     * @return - Promise resolves to list of keys for all objects in path
     */
    list(path: any, options?: any): Promise<any>;
    /**
     * @private
     */
    _ensureCredentials(): Promise<boolean>;
    /**
     * @private
     */
    private _prefix(options);
    /**
     * @private
     */
    private _createS3(options);
}
