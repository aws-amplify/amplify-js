import { AuthOptions } from './types';
/**
* Provide authentication steps
*/
export default class AuthClass {
    private _config;
    private userPool;
    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    constructor(config: AuthOptions);
    configure(config: any): AuthOptions;
    /**
     * Sign up with username, password and other attrbutes like phone, email
     * @param {String} username - The username to be signed up
     * @param {String} password - The password of the user
     * @param {Object} attributeList - Other attributes
     * @return - A promise resolves callback data if success
     */
    signUp(username: string, password: string, email: string, phone_number: string): Promise<any>;
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
     * Get current CognitoUser
     * @return - A promise resolves to curret CognitoUser if success
     */
    currentUser(): Promise<any>;
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
    /**
     * Get unauthenticated credentials
     * @return - A promise resolves to be a guest credentials
     */
    guestCredentials(): Promise<any>;
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
    currentUserInfo(): Promise<{
        username: any;
        id: any;
        email: any;
        phone_number: any;
    }>;
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
    /**
     * @return - A new guest CognitoIdentityCredentials
     */
    private noSessionCredentials();
    /**
     * Produce a credentials based on the session
     * @param {Object} session - The session used to generate the credentials
     * @return - A new CognitoIdentityCredentials
     */
    private sessionToCredentials(session);
    private attributesToObject(attributes);
}
