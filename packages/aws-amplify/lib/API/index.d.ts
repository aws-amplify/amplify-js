/**
 * Export Cloud Logic APIs
 */
export default class API {
    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    static configure(config: any): any;
    /**
     * Create an instance of API for the library
     * @return - A promise of true if Success
     */
    static createInstance(): true | Promise<never>;
    /**
     * Make a GET request
     * @param {String} apiName  - The api name of the request
     * @param {JSON} path - The path of the request'
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static get(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a POST request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static post(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a PUT request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static put(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a DEL request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static del(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a HEAD request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static head(apiName: any, path: any, init: any): Promise<any>;
    /**
    * Getting endpoint for API
    * @param {String} apiName - The name of the api
    * @return {String} - The endpoint of the api
    */
    static endpoint(apiName: any): Promise<any>;
}
