import { apiOptions } from './types';
/**
* HTTP Client for REST requests. Send and receive JSON data.
* Sign request with AWS credentials if available
* Usage:
<pre>
const restClient = new RestClient();
restClient.get('...')
    .then(function(data) {
        console.log(data);
    })
    .catch(err => console.log(err));
</pre>
*/
export declare class RestClient {
    _options: any;
    /**
    * @param {RestClientOptions} [options] - Instance options
    */
    constructor(options: apiOptions);
    /**
    * Update AWS credentials
    * @param {AWSCredentials} credentials - AWS credentials
    *
    updateCredentials(credentials: AWSCredentials) {
        this.options.credentials = credentials;
    }
*/
    /**
    * Basic HTTP request. Customizable
    * @param {string} url - Full request URL
    * @param {string} method - Request HTTP method
    * @param {json} [init] - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    ajax(url: string, method: string, init: any): Promise<any>;
    /**
    * GET HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    get(url: string, init: any): Promise<any>;
    /**
    * PUT HTTP request
    * @param {String} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    put(url: string, init: any): Promise<any>;
    /**
    * POST HTTP request
    * @param {String} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    post(url: string, init: any): Promise<any>;
    /**
    * DELETE HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    del(url: string, init: any): Promise<any>;
    /**
    * HEAD HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    head(url: string, init: any): Promise<any>;
    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    endpoint(apiName: string): string;
    /** private methods **/
    private _signed(params, credentials);
    private _unsigned(params);
    private _parseUrl(url);
}
