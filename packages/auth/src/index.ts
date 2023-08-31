// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Default provider APIs & enums
export {
	signUp,
	resetPassword,
	confirmResetPassword,
	signIn,
	resendSignUpCode,
	confirmSignUp,
	confirmSignIn,
	updateMFAPreference,
	fetchMFAPreference,
	verifyTOTPSetup,
	updatePassword,
	setUpTOTP,
	updateUserAttributes,
	getCurrentUser,
	confirmUserAttribute,
	signInWithRedirect,
	fetchUserAttributes,
	signOut,
	deleteUser,
} from './providers/cognito';
export {
	AuthResetPasswordStep,
	AuthSignInStep,
	AuthSignUpStep,
	AuthUpdateAttributeStep,
} from './types/enums';

export { AuthError } from './errors/AuthError';

export { fetchAuthSession } from '@aws-amplify/core';
