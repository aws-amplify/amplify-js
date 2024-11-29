// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStandardAttributeKey } from '@aws-amplify/core/internals/utils';

import { ChallengeName } from '../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { SignInOutput } from '../providers/cognito';

/**
 * Additional data that may be returned from Auth APIs.
 */
export type AuthAdditionalInfo = Record<string, string>;

export type AuthAnyAttribute = string & NonNullable<unknown>;

/**
 * Denotes the medium over which a confirmation code was sent.
 */
export type AuthDeliveryMedium = 'EMAIL' | 'SMS' | 'PHONE' | 'UNKNOWN';

/**
 * Data describing the dispatch of a confirmation code.
 */
export interface AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	destination?: string;
	deliveryMedium?: AuthDeliveryMedium;
	attributeName?: UserAttributeKey;
}
/**
 * Denotes the next step in the Reset Password process.
 */
export type AuthResetPasswordStep = 'CONFIRM_RESET_PASSWORD_WITH_CODE' | 'DONE';
export interface AuthNextResetPasswordStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	resetPasswordStep: AuthResetPasswordStep;
	additionalInfo?: AuthAdditionalInfo;
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
}

export interface AuthTOTPSetupDetails {
	sharedSecret: string;
	getSetupUri(appName: string, accountName?: string): URL;
}

export type AuthMFAType = 'SMS' | 'TOTP' | 'EMAIL';

export type AuthAllowedMFATypes = AuthMFAType[];

export interface ContinueSignInWithTOTPSetup {
	/**
	 * Auth step requires user to set up TOTP as multifactor authentication by associating an authenticator app
	 * and retrieving an OTP code.
	 *
	 * @example
	 * ```typescript
	 * // Code retrieved from authenticator app
	 * const otpCode = '112233';
	 * await confirmSignIn({challengeResponse: otpCode});
	 * ```
	 */
	signInStep: 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP';
	totpSetupDetails: AuthTOTPSetupDetails;
}
export interface ContinueSignInWithEmailSetup {
	/**
	 * Auth step requires user to set up EMAIL as multifactor authentication by associating an email address
	 * and entering the OTP.
	 *
	 * @example
	 * ```typescript
	 * // Code retrieved from email
	 * const emailAddress = 'example@example.com';
	 * await confirmSignIn({challengeResponse: emailAddress });
	 * ```
	 */
	signInStep: 'CONTINUE_SIGN_IN_WITH_EMAIL_SETUP';
}
export interface ConfirmSignInWithTOTPCode {
	/**
	 * Auth step requires user to use TOTP as multifactor authentication by retriving an OTP code from authenticator app.
	 *
	 * @example
	 * ```typescript
	 * // Code retrieved from authenticator app
	 * const otpCode = '112233';
	 * await confirmSignIn({challengeResponse: otpCode});
	 * ```
	 */
	signInStep: 'CONFIRM_SIGN_IN_WITH_TOTP_CODE';
}

export interface ContinueSignInWithMFASelection {
	/**
	 * Auth step requires user to select an mfa option (SMS | TOTP) to continue with the sign-in flow.
	 *
	 * @example
	 * ```typescript
	 * await confirmSignIn({challengeResponse:'TOTP'});
	 * // OR
	 * await confirmSignIn({challengeResponse:'SMS'});
	 * ```
	 */
	signInStep: 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION';
	allowedMFATypes?: AuthAllowedMFATypes;
}

export interface ContinueSignInWithMFASetupSelection {
	/**
	 * Auth step requires user to select an mfa option (SMS | TOTP) to setup before continuing the sign-in flow.
	 *
	 * @example
	 * ```typescript
	 * await confirmSignIn({challengeResponse:'TOTP'});
	 * // OR
	 * await confirmSignIn({challengeResponse:'EMAIL'});
	 * ```
	 */
	signInStep: 'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION';
	allowedMFATypes?: AuthAllowedMFATypes;
}

export interface ConfirmSignInWithCustomChallenge {
	/**
	 * Auth step requires user to respond to a custom challenge.
	 *
	 * @example
	 * ```typescript
	 * const challengeAnswer = 'my-custom-response';
	 * await confirmSignIn({challengeResponse: challengeAnswer});
	 * ```
	 */
	signInStep: 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE';
	additionalInfo?: AuthAdditionalInfo;
}

export interface ConfirmSignInWithNewPasswordRequired<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	/**
	 * Auth step requires user to change their password with any required attributes.
	 *
	 * @example
	 * ```typescript
	 * const attributes = {
	 *  email: 'email@email'
	 *  phone_number: '+11111111111'
	 * };
	 * const newPassword = 'my-new-password';
	 * await confirmSignIn({
	 *  challengeResponse: newPassword,
	 *  options: {
	 *    userAttributes: attributes
	 *   }
	 * });
	 * ```
	 */
	signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED';
	missingAttributes?: UserAttributeKey[];
}

export interface ConfirmSignInWithSMSCode {
	/**
	 * Auth step requires user to use SMS as multifactor authentication by retrieving a code sent to cellphone.
	 *
	 * @example
	 * ```typescript
	 * // Code retrieved from cellphone
	 * const smsCode = '112233'
	 * await confirmSignIn({challengeResponse: smsCode})
	 * ```
	 */
	signInStep: 'CONFIRM_SIGN_IN_WITH_SMS_CODE';
	codeDeliveryDetails?: AuthCodeDeliveryDetails;
}

export interface ConfirmSignInWithEmailCode {
	/**
	 * Auth step requires user to use EMAIL as multifactor authentication by retrieving a code sent to inbox.
	 *
	 * @example
	 * ```typescript
	 * // Code retrieved from email
	 * const emailCode = '112233'
	 * await confirmSignIn({challengeResponse: emailCode})
	 * ```
	 */
	signInStep: 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE';
	codeDeliveryDetails?: AuthCodeDeliveryDetails;
}

export interface ConfirmSignUpStep {
	/**
	 * Auth step requires to confirm user's sign-up.
	 *
	 * Try calling confirmSignUp.
	 */
	signInStep: 'CONFIRM_SIGN_UP';
}

export interface ResetPasswordStep {
	/**
	 * Auth step requires user to change their password.
	 *
	 * Try calling resetPassword.
	 */
	signInStep: 'RESET_PASSWORD';
}

export interface DoneSignInStep {
	/**
	 * The sign-in process is complete.
	 *
	 * No further action is needed.
	 */
	signInStep: 'DONE';
}

// New interfaces for USER_AUTH flow
export interface ContinueSignInWithFirstFactorSelection {
	signInStep: 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION';
	availableChallenges?: ChallengeName[];
}

export interface ConfirmSignInWithPassword {
	signInStep: 'CONFIRM_SIGN_IN_WITH_PASSWORD';
}

export type AuthNextSignInStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> =
	| ConfirmSignInWithCustomChallenge
	| ContinueSignInWithMFASelection
	| ConfirmSignInWithNewPasswordRequired<UserAttributeKey>
	| ConfirmSignInWithSMSCode
	| ConfirmSignInWithTOTPCode
	| ConfirmSignInWithEmailCode
	| ContinueSignInWithTOTPSetup
	| ContinueSignInWithEmailSetup
	| ContinueSignInWithMFASetupSelection
	| ContinueSignInWithFirstFactorSelection
	| ConfirmSignInWithPassword
	| ConfirmSignUpStep
	| ResetPasswordStep
	| DoneSignInStep;

/**
 * Key/value pairs describing a user attributes.
 */
export type AuthUserAttributes<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	[Attribute in UserAttributeKey]?: string;
};

/**
 * The interface of a user attribute.
 */
export interface AuthUserAttribute<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	attributeKey: UserAttributeKey;
	value: string;
}

/**
 * A user attribute key type consisting of standard OIDC claims or custom attributes.
 */
export type AuthUserAttributeKey = AuthStandardAttributeKey | AuthAnyAttribute;

/**
 * Denotes the next step in the Update User Attribute process.
 */
export type AuthUpdateAttributeStep =
	/**
	 * Auth update attribute step requires user to confirm an attribute with a code sent to cellphone or email.
	 */
	| 'CONFIRM_ATTRIBUTE_WITH_CODE'

	/**
	 * Auth update attribute step indicates that the attribute is updated.
	 */
	| 'DONE';
/**
 * Data encapsulating the next step in the Sign Up process
 */
export type AuthNextSignUpStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> =
	| ConfirmSignUpSignUpStep<UserAttributeKey>
	| AutoSignInSignUpStep<UserAttributeKey>
	| DoneSignUpStep;

export type AutoSignInCallback = () => Promise<SignInOutput>;
export interface DoneSignUpStep {
	signUpStep: 'DONE';
}

export interface ConfirmSignUpSignUpStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	signUpStep: 'CONFIRM_SIGN_UP';
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
}

export interface AutoSignInSignUpStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	signUpStep: 'COMPLETE_AUTO_SIGN_IN';
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
}

export interface AuthNextUpdateAttributeStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	updateAttributeStep: AuthUpdateAttributeStep;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
}

/**
 * The AWSAuthUser object contains username and userId from the idToken.
 */
export interface AWSAuthUser {
	username: string;
	userId: string;
}

/**
 * The AuthDevice object contains id and name of the device.
 */
export interface AuthDevice {
	id: string;
}
