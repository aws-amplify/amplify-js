// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { JwtExpiredError } from 'aws-jwt-verify/error';

import { JwtVerifier } from '../types';

/**
 * Verifies a Cognito JWT token for its validity.
 *
 * @param input - An object containing:
 *                - token: The JWT token as a string that needs to be verified.
 *                - verifier: The JWT verifier which will verify the token.
 * @internal
 */
export const isValidCognitoToken = async (input: {
	token: string;
	verifier: JwtVerifier;
}): Promise<boolean> => {
	const { token, verifier } = input;

	try {
		await verifier.verify(token);

		return true;
	} catch (error) {
		// When `JwtExpiredError` is thrown, the token should have valid signature
		// but expired. So, we can consider it as a valid token.
		// Reference https://github.com/awslabs/aws-jwt-verify/blob/8d8f714d7281913ecd660147f5c30311479601c1/src/jwt-rsa.ts#L290-L301
		if (error instanceof JwtExpiredError) {
			return true;
		}

		// TODO (ashwinkumar6): surface invalid cognito token error to customer
		// TODO: clear invalid tokens from Storage
		return false;
	}
};
