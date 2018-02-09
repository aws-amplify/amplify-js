export default class CognitoCredentials {
    private _credentials;
    private credentials_source;
    private _config;
    constructor(config?: any);
    configure(config: any): any;
    getCategory(): string;
    getProviderName(): string;
    setCredentials(config: any): Promise<any>;
    removeCredentials(): void;
    refreshCredentials(credentials: any): Promise<any>;
    isExpired(credentials: any): boolean;
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    retrieveCredentialsFromAuth(): Promise<any>;
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
    private setCredentialsForGuest();
    private setCredentialsFromSession(session);
    private setCredentialsFromFederation(federated);
}
