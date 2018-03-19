import { CredentialsProvider } from '../types';
export default class CognitoCredentials implements CredentialsProvider {
    private _credentials;
    private _credentials_source;
    private _config;
    private _userPool;
    private _userPoolStorageSync;
    private _gettingCredPromise;
    private _refreshHandlers;
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
    private _refreshFederatedToken(federatedInfo);
    private _refreshFacebookToken(callback);
    private _refreshGoogleToken(callback);
    private _isExpired(credentials);
    private _refreshCredentials(credentials);
    private _setCredentialsForGuest();
    private _setCredentialsFromSession(session);
    private _setCredentialsFromFederation(federated);
    currentSession(config?: any): Promise<any>;
    /**
     * Return the current user after synchornizing AsyncStorage
     * @return - A promise with the current authenticated user
     **/
    private _getSyncedUser();
    private _userSession(user);
}
