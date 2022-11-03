
// common types

import { OAuthOpts } from "../../lib-esm/types"

export type AuthPluginOptions = Record<string, any>

export type ClientMetaData = {
	[key:string]: string
}

export type ValidationData = {
	[key:string]: string
}

export type AuthUserAttributeKey = string;

export type AuthUserAttribute<AuthUserAttributeKey> = {
	userAttributeKey: AuthUserAttributeKey;
	value: string;
}

export type AuthUserAttributes = {
	[key:string]: string
}

export type AuthCodeDeliveryDetails<UserAttributeKey extends AuthUserAttributeKey> = {
	attributeName?: UserAttributeKey;
	deliveryMedium: DeliveryMedium;
	destination: string;
}

export enum DeliveryMedium {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
	UNKNOWN = 'UNKNOWN'
}

export enum AuthProvider {
	GOOGLE = 'GOOGLE',
	FACEBOOK = 'FACEBOOK',
	AMAZON = 'AMAZON',
	COGNITO = 'COGNITO'
}

export type CognitoUserAttributeKey =
  | "address"
  | "birthday"
  | "email"
  | "family_name"
  | "gender"
  | "given_name"
  | "locale"
  | "middle_name"
  | "name"
  | "nickname"
  | "phone_number"
  | "picture"
  | "preferred_username"
  | "profile"
  | "update_at"
  | "website"
  | "zoneinfo"
  | `custom:${string}`;


// configure

export type AuthOptions = {
	userPoolId?: string;
	userPoolWebClientId?: string;
	identityPoolId?: string;
	region?: string;
	mandatorySignIn?: boolean;
	cookieStorage?: ICookieStorageData;
	oauth?: OAuthOpts;
	refreshHandlers?: object;
	storage?: ICognitoStorage;
	authenticationFlowType?: string;
	identityPoolRegion?: string;
	clientMetaData?: any;
	endpoint?: string;
	signUpVerificationMethod?: 'code' | 'link';
}

export type ICookieStorageData = {
	domain: string;
	path?: string;
	expires?: number;
	secure?: boolean;
	sameSite?: 'strict' | 'lax' | 'none';
}

export type ICognitoStorage = {
	setItem(key: string, value: string): void;
	getItem(key: string): string | null;
	removeItemKey(key: string): void;
	clear(): void;
}

//Sign up

export type CognitoUserAttributes<UserAttributeKey extends AuthUserAttributeKey = CognitoUserAttributeKey> = Record<UserAttributeKey, string>;

export type AutoSignInOptions = {
	enabled: boolean;
	clientMetaData?: ClientMetaData;
	validationData?: ValidationData;
}

export type AuthSignUpOptions<UserAttributeKey, PluginOptions> = {
	userAttributes: AuthUserAttribute<UserAttributeKey>[];
	autoSignIn?: AutoSignInOptions;
	pluginOptions?: PluginOptions;
} 

export type AuthSignUpResult<UserAttributeKey extends AuthUserAttributeKey> = {
	isSignUpComplete: boolean;
	nextStep?: AuthNextSignUpStep<UserAttributeKey>;
}

export type AuthNextSignUpStep<UserAttributeKey extends AuthUserAttributeKey> = {
	additionalInfo?: { [key: string]: string };
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	signUpStep: AuthSignUpStep;
}

export const enum AuthSignUpStep {
	CONFIRM_SIGN_UP = "CONFIRM_SIGN_UP",
	DONE = "DONE"
}

export type SignUpRequest<UserAttributeKey extends AuthUserAttributeKey, PluginOptions> = {
	username: string;
	password: string;
	options?: AuthSignUpOptions<UserAttributeKey, PluginOptions>;
}

export interface CognitoSignUpOptions extends AuthPluginOptions {
	clientMetaData?: ClientMetaData;
	validationData?: ValidationData;
}

// export type SignUpCognitoPluginOptions = CognitoPluginOptions & {
// 	validationData?: ValidationData;
// }

// sign in

export type AuthSignInResult<UserAttributeKey extends AuthUserAttributeKey> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
}

export type AuthNextSignInStep<UserAttributeKey extends AuthUserAttributeKey> = {
	signInStep: AuthSignInStep;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	additionalInfo?: { [key: string]: string };
	totpCode?: string;
	missingAttributes?: any[]; // TODO change to Attributes[]
}

export enum AuthSignInStep {
	CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE = 'CONFIRM_SIGN_IN_SMS_MFA_CODE',
	CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE = 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
	CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED = 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
	CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE = 'CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE',
	SELECT_MFA_TYPE = 'SELECT_MFA_TYPE',
	CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',
	RESET_PASSWORD = 'RESET_PASSWORD',  
	DONE = 'DONE',
}

// sign out

export type SignOutResult = {

}


// reset password

export type ResetPasswordResult = {

}