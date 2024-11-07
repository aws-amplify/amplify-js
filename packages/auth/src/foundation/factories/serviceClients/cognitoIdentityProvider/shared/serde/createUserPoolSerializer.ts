// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	Headers,
	HttpRequest,
} from '@aws-amplify/core/internals/aws-client-utils';

type ClientOperation =
	| 'SignUp'
	| 'ConfirmSignUp'
	| 'ForgotPassword'
	| 'ConfirmForgotPassword'
	| 'InitiateAuth'
	| 'RespondToAuthChallenge'
	| 'ResendConfirmationCode'
	| 'VerifySoftwareToken'
	| 'AssociateSoftwareToken'
	| 'SetUserMFAPreference'
	| 'GetUser'
	| 'ChangePassword'
	| 'ConfirmDevice'
	| 'ForgetDevice'
	| 'DeleteUser'
	| 'GetUserAttributeVerificationCode'
	| 'GlobalSignOut'
	| 'UpdateUserAttributes'
	| 'VerifyUserAttribute'
	| 'DeleteUserAttributes'
	| 'UpdateDeviceStatus'
	| 'ListDevices'
	| 'RevokeToken'
	| 'StartWebAuthnRegistration'
	| 'CompleteWebAuthnRegistration'
	| 'ListWebAuthnCredentials'
	| 'DeleteWebAuthnCredential';

export const createUserPoolSerializer =
	<Input>(operation: ClientOperation) =>
	(input: Input, endpoint: Endpoint): HttpRequest => {
		const headers = getSharedHeaders(operation);
		const body = JSON.stringify(input);

		return buildHttpRpcRequest(endpoint, headers, body);
	};

const getSharedHeaders = (operation: string): Headers => ({
	'content-type': 'application/x-amz-json-1.1',
	'x-amz-target': `AWSCognitoIdentityProviderService.${operation}`,
});

const buildHttpRpcRequest = (
	{ url }: Endpoint,
	headers: Headers,
	body: string,
): HttpRequest => ({
	headers,
	url,
	body,
	method: 'POST',
});
