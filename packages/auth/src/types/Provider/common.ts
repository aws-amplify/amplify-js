import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';

export interface AuthUserAttribute {
	Name: string;
	Value: string;
}

export enum DeliveryMedium {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
	UNKNOWN = 'UNKNOWN',
}

export interface AuthCodeDeliveryDetails {
	destination: string;
	deliveryMedium: DeliveryMedium;
	attributeName: string | ((value: string) => string);
}

export interface AuthSignUpOptions {
	userAttributes: AuthUserAttribute[];
	pluginOptions?: any;
}

export interface AuthSignUpResult {
	isSignUpComplete: boolean;
	nextStep?: AuthNextSignUpStep;
}

export enum AuthSignUpStep {
	CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',
	DONE = 'DONE',
}

export interface AuthNextSignUpStep {
	signUpStep: AuthSignUpStep;
	additionalInfo: Record<string, string>;
	codeDeliveryDetails: AuthCodeDeliveryDetails;
}

export interface AuthStateFlow {}

export interface AuthUser {}

// TODO: get correct enum values
export enum MfaOption {
	EMAIL = 'TOTP',
	SMS = 'SMS',
	NOMFA = 'NOMFA',
}

export interface AuthSignInResult {}

export { AuthFlowType };
