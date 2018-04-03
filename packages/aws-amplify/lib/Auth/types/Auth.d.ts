import { ICookieStorageData } from "amazon-cognito-identity-js";
/**
* Parameters for user sign up
*/
export interface SignUpParams {
    username: string;
    password: string;
    SignupAttributes?: Object;
}
/**
* Auth instance options
*/
export interface AuthOptions {
    userPoolId: string;
    userPoolWebClientId: string;
    identityPoolId: string;
    region?: string;
    mandatorySignIn: boolean;
    cookieStorage?: ICookieStorageData;
}
/**
* Details for multi-factor authentication
*/
export interface MfaRequiredDetails {
    challengeName: any;
    challengeParameters: any;
}
/**
 * interface for federatedResponse
 */
export interface FederatedResponse {
    token: string;
    expires_at: number;
}
