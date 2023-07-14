// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Denotes the next step in the Reset Password process.
 */
export enum AuthResetPasswordStep {
	CONFIRM_RESET_PASSWORD_WITH_CODE = 'CONFIRM_RESET_PASSWORD_WITH_CODE',
	DONE = 'DONE',
}

/**
 * Denotes the next step in the Sign In process.
 */
export enum AuthSignInStep {
	/**
	 * Auth step requires user to use SMS as multifactor authentication by retriving a code sent to cellphone.
	 *
	 * ```typescript
	 *  // Example
	 *
	 *   // Code retrieved from cellphone
	 *   const smsCode = '112233'
	 *   await confirmSignIn({challengeResponse: smsCode})
	 * ```
	 */
	CONFIRM_SIGN_IN_WITH_SMS_CODE = 'CONFIRM_SIGN_IN_WITH_SMS_CODE',

	/**
	 * Auth step requires user to respond to a custom challenge.
	 *
	 * ```typescript
	 *  // Example
	 *
	 *   const challengeAnswer = 'my-custom-response'
	 *   await confirmSignIn({challengeResponse: challengeAnswer})
	 * ```
	 */
	CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE = 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',

	/**
	 * Auth step requires user to change their password with any requierd attributes.
	 *
	 * ```typescript
	 *  // Example
	 *
	 *   const attributes = {
	 *    email: 'email@email'
	 *    phone_number: '+11111111111'
	 *    }
	 *   const newPassword = 'my-new-password'
	 *   await confirmSignIn({
	 *     challengeResponse: newPassword,
	 *     options: {
	 *       serviceOptions: {
	 *        userAttributes: attributes
	 *       }
	 *     }
	 *    })
	 * ```
	 */
	CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED = 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',

	/**
	 * Auth step requires user to use TOTP as multifactor authentication by retriving an OTP code from authenticator app.
	 * 
	 * ```typescript
	 *  // Example
	 *  
	 *   // Code retrieved from authenticator app
	 *   const otpCode = '112233'
	 *   await confirmSignIn({challengeResponse: otpCode})
	 
	 * ```
	 */
	CONFIRM_SIGN_IN_WITH_TOTP_CODE = 'CONFIRM_SIGN_IN_WITH_TOTP_CODE',

	/**
	 * Auth step requires user to set up TOTP as multifactor authentication by associating an authenticator app
	 * and retriving an OTP code.
	 * 
	 * ```typescript
	 *  // Example
	 *  
	 *   // Code retrieved from authenticator app
	 *   const otpCode = '112233'
	 *   await confirmSignIn({challengeResponse: otpCode})
	 
	 * ```
	 */
	CONTINUE_SIGN_IN_WITH_TOTP_SETUP = 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP',

	/**
	 * Auth step requires user to select an mfa option(SMS | TOTP) to continue with the sign-in flow.
	 *
	 * ```typescript
	 *  // Example
	 *
	 *   await confirmSignIn({challengeResponse:'TOTP'})
	 *   // OR
	 *   await confirmSignIn({challengeResponse:'SMS'})
	 * ```
	 */
	CONTINUE_SIGN_IN_WITH_MFA_SELECTION = 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',

	/**
	 * Auth step requires to confirm user's sign-up.
	 *
	 * Try calling confirmSignUp.
	 */
	CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',

	/**
	 * Auth step requires user to chage their password.
	 *
	 * Try calling resetPassword.
	 */
	RESET_PASSWORD = 'RESET_PASSWORD',

	/**
	 * The sign-in process is complete.
	 *
	 * No further action is needed.
	 */
	DONE = 'DONE',
}

/**
 * Denotes the next step in the Sign Up process.
 */
export enum AuthSignUpStep {
	CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',
	DONE = 'DONE',
}
