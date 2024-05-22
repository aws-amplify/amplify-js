// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// 'aws-jwt-verify' doesn't support RN, noop implementation
// TODO: add a polyfill to support the same
export const isValidCognitoToken = async (_input: {
	token: string;
	userPoolId: string;
	clientId: string;
	tokenType: string;
}): Promise<boolean> => {
	return true;
};
