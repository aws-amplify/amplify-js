// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';

/**
 * Verifies a Cognito JWT token for its validity.
 *
 * @param input - An object containing:
 *                - token: The JWT token as a string that needs to be verified.
 *                - userPoolId: The ID of the AWS Cognito User Pool to which the token belongs.
 *                - clientId: The Client ID associated with the Cognito User Pool.
 * @internal
 */
export const isValidCognitoToken = async (input: {
	token: string;
	userPoolId: string;
	clientId: string;
	tokenType: 'id' | 'access';
}): Promise<boolean> => {
	const { userPoolId, clientId, tokenType, token } = input;

	try {
		const verifier = CognitoJwtVerifier.create({
			userPoolId,
			tokenUse: tokenType,
			clientId,
		});
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
