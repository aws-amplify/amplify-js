// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClientMetadata } from '../models/ClientMetadata';

/**
 * Options specific to a Cognito Resend Sign Up code request.
 */
export type CognitoResendSignUpCodeOptions = {
	clientMetadata?: ClientMetadata;
};
