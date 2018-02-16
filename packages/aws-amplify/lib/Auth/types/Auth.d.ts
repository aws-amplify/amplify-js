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
}
/**
* Details for multi-factor authentication
*/
export interface MfaRequiredDetails {
    challengeName: any;
    challengeParameters: any;
}
