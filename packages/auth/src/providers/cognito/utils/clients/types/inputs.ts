// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ForgotPasswordCommandInput,
	SignUpCommandInput,
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
