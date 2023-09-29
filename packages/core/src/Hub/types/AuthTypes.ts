// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type AuthUser = {
	username: string;
	userId: string;
};

export type AuthStandardAttributeKey =
	| 'address'
	| 'birthdate'
	| 'email'
	| 'email_verified'
	| 'family_name'
	| 'gender'
	| 'given_name'
	| 'locale'
	| 'middle_name'
	| 'name'
	| 'nickname'
	| 'phone_number'
	| 'phone_number_verified'
	| 'picture'
	| 'preferred_username'
	| 'profile'
	| 'sub'
	| 'updated_at'
	| 'website'
	| 'zoneinfo';
export type AuthAnyAttribute = string & {};
/**
 * A user attribute key type consisting of standard OIDC claims or custom attributes.
 */
export type AuthUserAttributeKey = AuthStandardAttributeKey | AuthAnyAttribute;
export type AuthSignInOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
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
/**
 * Additional data that may be returned from Auth APIs.
 */
export type AuthAdditionalInfo = { [key: string]: string };

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
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
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
	 *   serviceOptions: {
	 *    userAttributes: attributes
	 *    }
	 *   }
	 * });
	 * ```
	 */
	signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED';
	missingAttributes?: UserAttributeKey[];
};

/**
 * Denotes the medium over which a confirmation code was sent.
 */
export type AuthDeliveryMedium = 'EMAIL' | 'SMS' | 'PHONE' | 'UNKNOWN';

export type AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	destination?: string;
	deliveryMedium?: AuthDeliveryMedium;
	attributeName?: UserAttributeKey;
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
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
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

export type AuthHubEventData =
	/** Dispatched when a user signs in with an oauth provider such as Google.*/
	| { event: 'signInWithRedirect' }
	/** Dispatched when there is an error in the oauth flow process.*/
	| { event: 'signInWithRedirect_failure' }
	/** Dispatched when auth tokens are successfully refreshed.*/
	| { event: 'tokenRefresh' }
	/** Dispatched when there is an error in the refresh of tokens.*/
	| { event: 'tokenRefresh_failure' }
	/** Dispatched when there is a customState passed in the options of the `signInWithRedirect` API.*/
	| { event: 'customOAuthState'; data: string }
	/** Dispatched when the user is signed-in.*/
	| { event: 'signedIn'; data: AuthUser }
	/** Dispatched after the user calls the `signOut` API successfully.*/
	| { event: 'signedOut' }
	| { event: 'autoSignIn'; data: AuthSignInOutput };
