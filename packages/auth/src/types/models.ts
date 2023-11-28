// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignInOutput } from '../providers/cognito';
import { AuthStandardAttributeKey } from '@aws-amplify/core/internals/utils';

/**
 * Additional data that may be returned from Auth APIs.
 */
export type AuthAdditionalInfo = { [key: string]: string };

export type AuthAnyAttribute = string & {};

/**
 * Denotes the medium over which a confirmation code was sent.
 */
export type AuthDeliveryMedium = 'EMAIL' | 'SMS' | 'PHONE' | 'UNKNOWN';

/**
 * Data describing the dispatch of a confirmation code.
 */
export type AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	destination?: string;
	deliveryMedium?: AuthDeliveryMedium;
	attributeName?: UserAttributeKey;
};
/**
 * Denotes the next step in the Reset Password process.
 */
export type AuthResetPasswordStep = 'CONFIRM_RESET_PASSWORD_WITH_CODE' | 'DONE';
export type AuthNextResetPasswordStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	resetPasswordStep: AuthResetPasswordStep;
	additionalInfo?: AuthAdditionalInfo;
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
};

export type AuthTOTPSetupDetails = {
	sharedSecret: string;
	getSetupUri: (appName: string, accountName?: string) => URL;
};

export type AuthMFAType = 'SMS' | 'TOTP';

export type AuthAllowedMFATypes = AuthMFAType[];

export type ContinueSignInWithTOTPSetup = {
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
};
export type ConfirmSignInWithTOTPCode = {
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
};

export type ContinueSignInWithMFASelection = {
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
};

export type ConfirmSignInWithCustomChallenge = {
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
};

export type ConfirmSignInWithNewPasswordRequired<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
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
};

export type ConfirmSignInWithSMSCode = {
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
};

export type ConfirmSignUpStep = {
	/**
	 * Auth step requires to confirm user's sign-up.
	 *
	 * Try calling confirmSignUp.
	 */
	signInStep: 'CONFIRM_SIGN_UP';
};

export type ResetPasswordStep = {
	/**
	 * Auth step requires user to change their password.
	 *
	 * Try calling resetPassword.
	 */
	signInStep: 'RESET_PASSWORD';
};

export type DoneSignInStep = {
	/**
	 * The sign-in process is complete.
	 *
	 * No further action is needed.
	 */
	signInStep: 'DONE';
};

export type AuthNextSignInStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> =
	| ConfirmSignInWithCustomChallenge
	| ContinueSignInWithMFASelection
	| ConfirmSignInWithNewPasswordRequired<UserAttributeKey>
	| ConfirmSignInWithSMSCode
	| ConfirmSignInWithTOTPCode
	| ContinueSignInWithTOTPSetup
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
export type AuthUserAttribute<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	attributeKey: UserAttributeKey;
	value: string;
};

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
export type DoneSignUpStep = {
	signUpStep: 'DONE';
};

export type ConfirmSignUpSignUpStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	signUpStep: 'CONFIRM_SIGN_UP';
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
};

export type AutoSignInSignUpStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	signUpStep: 'COMPLETE_AUTO_SIGN_IN';
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
};

export type AuthNextUpdateAttributeStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	updateAttributeStep: AuthUpdateAttributeStep;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
};

/**
 * The AWSAuthUser object contains username and userId from the idToken.
 */
export type AWSAuthUser = {
	username: string;
	userId: string;
};

/**
 * The AuthDevice object contains id and name of the device.
 */
export type AuthDevice = {
	id: string;
};
