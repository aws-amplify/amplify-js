// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConfirmSignInOutput } from '../../types';

export type ConfirmSignInWithMagicLinkInput = {
	challengeResponse: string;
};

/**
 * TODO: support confirm sign-in with Magic Link without a username, as long as the challengeResponse matches the
 * libraryOptions.Auth.magicLinkRedirectURL.
 *
 * No special changes for sign-in with OTP.
 */
export const attemptConfirmSignInWithMagicLink = async (
	input: ConfirmSignInWithMagicLinkInput
): Promise<ConfirmSignInOutput> => {
	// TODO: needs implementation
	return {
		isSignedIn: true,
		nextStep: { signInStep: 'DONE' },
	};
};
