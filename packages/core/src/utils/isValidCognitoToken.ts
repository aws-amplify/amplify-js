// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoJwtVerifier } from 'aws-jwt-verify';

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
		return false;
	}
};
