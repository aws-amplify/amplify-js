import { AuthOptions } from './types';
/**
* Provide authentication steps
*/
export default class AuthClass {
    private _config;
    private _userPoolStorageSync;
    private userPool;
    private credentials;
    private credentials_source;
    private user;
    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    constructor(config: AuthOptions);
    configure(config: any): AuthOptions;
    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String | object} params - The user attirbutes used for signin
     * @param {String[]} restOfAttrs - for the backward compatability
     * @return - A promise resolves callback data if success
     */
    signUp(params: string | object, ...restOfAttrs: string[]): Promise<any>;
    /**
     * Send the verfication code to confirm sign up
     * @param {String} username - The username to be confirmed
     * @param {String} code - The verification code
     * @return - A promise resolves callback data if success
     */
    confirmSignUp(username: string, code: string): Promise<any>;
    /**
     * Resend the verification code
     * @param {String} username - The username to be confirmed
     * @return - A promise resolves data if success
     */
    resendSignUp(username: string): Promise<any>;
    /**
     * Sign in
     * @param {String} username - The username to be signed in
     * @param {String} password - The password of the username
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    signIn(username: string, password: string): Promise<any>;
    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    confirmSignIn(user: any, code: string): Promise<any>;
    completeNewPassword(user: any, password: string, requiredAttributes: any): Promise<any>;
    /**
     * Update an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise}
     **/
    updateUserAttributes(user: any, attributes: object): Promise<any>;
    /**
     * Return user attributes
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to user attributes if success
     */
    userAttributes(user: any): Promise<any>;
    verifiedContact(user: any): Promise<{
        verified: {};
        unverified: {};
    }>;
    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    currentUserPoolUser(): Promise<any>;
    /**
     * Return the current user after synchornizing AsyncStorage
     * @return - A promise with the current authenticated user
     **/
    private getSyncedUser();
    /**
     * Get current authenticated user
     * @return - A promise resolves to curret authenticated CognitoUser if success
     */
    currentAuthenticatedUser(): Promise<any>;
    /**
     * Get current user's session
     * @return - A promise resolves to session object if success
     */
    currentSession(): Promise<any>;
    /**
     * Get the corresponding user session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    userSession(user: any): Promise<any>;
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    currentUserCredentials(): Promise<any>;
    currentCredentials(): Promise<any>;
    /**
     * Initiate an attribute confirmation request
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attributes to be verified
     * @return - A promise resolves to callback data if success
     */
    verifyUserAttribute(user: any, attr: any): Promise<any>;
    /**
     * Confirm an attribute using a confirmation code
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    verifyUserAttributeSubmit(user: any, attr: any, code: any): Promise<any>;
    verifyCurrentUserAttribute(attr: any): Promise<any>;
    /**
     * Confirm current user's attribute using a confirmation code
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    verifyCurrentUserAttributeSubmit(attr: any, code: any): Promise<any>;
    /**
     * Sign out method
     * @return - A promise resolved if success
     */
    signOut(): Promise<any>;
    /**
     * Change a password for an authenticated user
     * @param {Object} user - The CognitoUser object
     * @param {String} oldPassword - the current password
     * @param {String} newPassword - the requested new password
     * @return - A promise resolves if success
     */
    changePassword(user: any, oldPassword: string, newPassword: string): Promise<any>;
    /**
     * Initiate a forgot password request
     * @param {String} username - the username to change password
     * @return - A promise resolves if success
     */
    forgotPassword(username: string): Promise<any>;
    /**
     * Confirm a new password using a confirmation Code
     * @param {String} username - The username
     * @param {String} code - The confirmation code
     * @param {String} password - The new password
     * @return - A promise that resolves if success
     */
    forgotPasswordSubmit(username: string, code: string, password: string): Promise<any>;
    /**
     * Get user information
     * @async
     * @return {Object }- current User's information
     */
    currentUserInfo(): Promise<any>;
    /**
     * For federated login
     * @param {String} provider - federation login provider
     * @param {Object} response - response including access_token
     * @param {String} user - user info
     */
    federatedSignIn(provider: any, response: any, user: any): Promise<any>;
    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    essentialCredentials(credentials: any): {
        accessKeyId: any;
        sessionToken: any;
        secretAccessKey: any;
        identityId: any;
        authenticated: any;
    };
    private attributesToObject(attributes);
    private setCredentialsFromFederation(provider, token, user);
    private pickupCredentials();
    private setCredentialsFromAWS();
    private setCredentialsForGuest();
    private setCredentialsFromSession(session);
    private keepAlive();
}
