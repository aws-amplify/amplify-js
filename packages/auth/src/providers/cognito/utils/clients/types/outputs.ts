// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ConfirmForgotPasswordCommandOutput,
	ForgotPasswordCommandOutput,
	InitiateAuthCommandOutput,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

export type ClientOutputs =
	| SignUpCommandOutput
	| ForgotPasswordCommandOutput
	| InitiateAuthCommandOutput
	| ConfirmForgotPasswordCommandOutput;
