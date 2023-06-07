// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClientMetadata } from '../models/ClientMetadata';
import { ValidationData } from '../models/ValidationData';

/**
 * Options specific to a Cognito Sign Up request.
 */
export type CognitoSignUpOptions = {
	validationData?: ValidationData;
	clientMetadata?: ClientMetadata;
	// autoSignIn?: AutoSignInOptions;
};
