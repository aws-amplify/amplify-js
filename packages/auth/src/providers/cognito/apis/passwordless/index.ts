// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { signUpPasswordless } from './signUp';
export { signInPasswordless } from './signIn';
export {
	assertSignUpWithEmailOptions,
	assertSignUpWithSMSOptions,
	isSignInWithEmailAndMagicLinkInput,
	isSignInWithEmailAndOTPInput,
	isSignInWithSMSAndOTPInput,
	isSignUpWithEmailAndMagicLinkInput,
	isSignUpWithEmailAndOTPInput,
	isSignUpWithSMSAndOTPInput,
} from './utils';
