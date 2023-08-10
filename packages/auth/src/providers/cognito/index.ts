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
export { cognitoCredentialsProvider } from './credentialsProvider';
export { CognitoUserPoolsTokenProvider } from './tokenProvider';
