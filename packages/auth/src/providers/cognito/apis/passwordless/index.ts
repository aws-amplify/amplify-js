// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { signUp } from './signUp';
export { signIn } from './signIn';
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
export {
	isMagicLinkFragment,
	loadMagicLinkSignInState,
} from './confirmSignInWithMagicLink';
export {
	KEY_PASSWORDLESS_ACTION,
	KEY_PASSWORDLESS_SIGN_IN_METHOD,
} from './constants';
