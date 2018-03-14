export default class CognitoCredentials {
    private _credentials;
    private credentials_source;
    private _config;
    private gettingCred;
    private _currentSessionHandler;
    constructor(config?: any);
    /**
     * pass the configuration
     * @param config
     */
    configure(config: any): any;
    /**
     * Get the category of this provider
     */
    getCategory(): string;
    /**
     * Get the name of this provider
     */
    getProviderName(): string;
    /**
     * Set the credentials with configuration
     * @param config - the configuration to set the credentials
     */
    setCredentials(config: any): Promise<{}>;
    /**
     * Remove the credential from library
     */
    removeCredentials(): void;
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    getCredentials(config?: any): Promise<any>;
    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    essentialCredentials(params: any): {
        accessKeyId: any;
        sessionToken: any;
        secretAccessKey: any;
        identityId: any;
        authenticated: any;
    };
    private _retrieveCredentialsFromAuth();
    private _isExpired(credentials);
    private _refreshCredentials(credentials);
    private _setCredentialsForGuest();
    private _setCredentialsFromSession(session);
    private _setCredentialsFromFederation(federated);
}
