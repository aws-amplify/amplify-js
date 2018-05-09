/// <reference types="zen-observable" />
import * as Observable from 'zen-observable';
import { GraphQLOptions, GraphQLResult } from './types';
export declare const graphqlOperation: (query: any, variables?: {}) => {
    query: any;
    variables: {};
};
/**
 * Export Cloud Logic APIs
 */
export default class APIClass {
    /**
     * @private
     */
    private _options;
    private _api;
    /**
     * Initialize Storage with AWS configurations
     * @param {Object} options - Configuration object for storage
     */
    constructor(options: any);
    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    configure(options: any): any;
    /**
     * Create an instance of API for the library
     * @return - A promise of true if Success
     */
    createInstance(): true | Promise<never>;
    /**
     * Make a GET request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    get(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a POST request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    post(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a PUT request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    put(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a PATCH request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    patch(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a DEL request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    del(apiName: any, path: any, init: any): Promise<any>;
    /**
     * Make a HEAD request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    head(apiName: any, path: any, init: any): Promise<any>;
    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    endpoint(apiName: any): Promise<any>;
    private _headerBasedAuth(defaultAuthenticationType?);
    /**
     * Executes a GraphQL operation
     *
     * @param {GraphQLOptions} GraphQL Options
     * @returns {Promise<GraphQLResult> | Observable<object>}
     */
    graphql({query, variables}: GraphQLOptions): Promise<GraphQLResult> | Observable<object>;
    private _graphql({query: queryStr, variables});
    private _graphqlSubscribe({query, variables});
    /**
     * @private
     */
    _ensureCredentials(): Promise<any>;
}
