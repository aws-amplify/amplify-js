// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { signUp } from './apis/signUp';
export { resetPassword } from './apis/resetPassword';
export { confirmResetPassword } from './apis/confirmResetPassword';
export { signIn } from './apis/signIn';
export { resendSignUpCode } from './apis/resendSignUpCode';
export { confirmSignUp } from './apis/confirmSignUp';
export { confirmSignIn } from './apis/confirmSignIn';
export { updateMFAPreference } from './apis/updateMFAPreference';
export { fetchMFAPreference } from './apis/fetchMFAPreference';
export { verifyTOTPSetup } from './apis/verifyTOTPSetup';
export { updatePassword } from './apis/updatePassword';
export { setUpTOTP } from './apis/setUpTOTP';
export { updateUserAttributes } from './apis/updateUserAttributes';
export { getCurrentUser } from './apis/getCurrentUser';
export { confirmUserAttribute } from './apis/confirmUserAttribute';
export { signInWithRedirect } from './apis/signInWithRedirect';
export { fetchUserAttributes } from './apis/fetchUserAttributes';
export { signOut } from './apis/signOut';
export {
	GetCurrentUserInput,
	ConfirmResetPasswordInput,
	ConfirmSignInInput,
	ConfirmSignUpInput,
	ConfirmUserAttributeInput,
	ResendSignUpCodeInput,
	ResetPasswordInput,
	SignInInput,
	SignInWithRedirectInput,
	SignOutInput,
	SignUpInput,
	UpdateMFAPreferenceInput,
	UpdatePasswordInput,
	UpdateUserAttributesInput,
	VerifyTOTPSetupInput,
} from './types/inputs';

export {
	FetchUserAttributesOutput,
	GetCurrentUserOutput,
	ConfirmSignInOutput,
	ConfirmSignUpOutput,
	FetchMFAPreferenceOutput,
	ResendSignUpCodeOutput,
	ResetPasswordOutput,
	SetUpTOTPOutput,
	SignInOutput,
	SignOutOutput,
	SignUpOutput,
	UpdateUserAttributesOutput,
} from './types/outputs';
export {
	cognitoCredentialsProvider,
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from './credentialsProvider';
export {
	CognitoUserPoolsTokenProvider,
	CognitoUserPoolTokenProviderType,
	TokenOrchestrator,
	DefaultTokenStore,
	CognitoUserPoolTokenRefresher,
} from './tokenProvider';
