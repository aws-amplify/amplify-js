export enum UsernameAttributes {
    EMAIL = "email",
    PHONE_NUMBER = "phone_number",
    USERNAME = "username"
}

export interface FederatedConfig {
    google_client_id?: string
    facebook_app_id?: string
    amazon_client_id?: string
}

export type AuthState =
    | 'signIn'
    | 'signUp'
    | 'confirmSignIn'
    | 'confirmSignUp'
    | 'forgotPassword'
    | 'requireNewPassword'
    | 'verifyContact'
    | 'signedIn';
