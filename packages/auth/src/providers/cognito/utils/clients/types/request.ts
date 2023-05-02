// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ForgotPasswordCommandInput,
	SignUpCommandInput,
	ConfirmSignUpCommandInput,
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandInput,
	ConfirmForgotPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export type SendCognitoHttpClientRequest =
	| { operation: 'SignUp'; input: SignUpCommandInput }
	| { operation: 'ConfirmSignUp'; input: ConfirmSignUpCommandInput }
	| { operation: 'ForgotPassword'; input: ForgotPasswordCommandInput }
	| {
			operation: 'ConfirmForgotPassword';
			input: ConfirmForgotPasswordCommandInput;
	  }
	| { operation: 'InitiateAuth'; input: InitiateAuthCommandInput }
	| {
			operation: 'RespondToAuthChallenge';
			input: RespondToAuthChallengeCommandInput;
	  };
