export default class CredentialsClass {
    private _config;
    private _pluggables;
    constructor();
    /**
     * Configure
     * @param {Object} config - the configuration
     */
    configure(config: any): any;
    /**
     * Add pluggables to Credentials category
     * @param {Object} pluggable - plugin
     */
    addPluggable(pluggable: any): any;
    /**
     * Set credentials with configuration
     * @param {Object} config - the configuration
     */
    setCredentials(config?: any): Promise<{}>;
    /**
     * Remove credentials with configuration
     * @param {Object} config - the configuraiton
     */
    removeCredentials(config?: any): void;
    /**
     * cut credentials to compact version
     * @param params
     */
    essentialCredentials(params: any): any;
    /**
     * Get credentials with configuration
     * @param {Object} config - the configuraiton
     */
    getCredentials(config?: any): Promise<{}>;
}
