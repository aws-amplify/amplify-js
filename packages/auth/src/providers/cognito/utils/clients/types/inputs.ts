// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ForgotPasswordCommandInput,
	SignUpCommandInput,
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandInput,
	ConfirmForgotPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export type SignUpClientInput = Pick<
	SignUpCommandInput,
	| 'Username'
	| 'Password'
	| 'UserAttributes'
	| 'ClientMetadata'
	| 'ValidationData'
>;

export type ResetPasswordClientInput = Pick<
	ForgotPasswordCommandInput,
	'Username' | 'ClientMetadata'
>;

export type InitiateAuthClientInput = Pick<
	InitiateAuthCommandInput,
	'AuthFlow' | 'AuthParameters' | 'ClientMetadata'
>;

export type RespondToAuthChallengeClientInput = Pick<
	RespondToAuthChallengeCommandInput,
	'ChallengeName' | 'ChallengeResponses' | 'ClientMetadata' | 'Session'
>;

export type ConfirmResetPasswordClientInput = Pick<
	ConfirmForgotPasswordCommandInput,
	| 'Username'
	| 'ConfirmationCode'
	| 'Password'
	| 'ClientMetadata'
>;