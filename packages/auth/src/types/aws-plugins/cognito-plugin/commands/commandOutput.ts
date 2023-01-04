// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
	ForgotPasswordCommandOutput,
	InitiateAuthCommandOutput, 
	SignUpCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';

export type CommandOutput = 
	SignUpCommandOutput | 
	InitiateAuthCommandOutput |
	ForgotPasswordCommandOutput; // TODO: add more outputs when adding more functions to auth
