// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolsTokenProvider } from './CognitoUserPoolsTokenProvider';

/**
 * The default provider for the JWT access token and ID token issued from the configured Cognito user pool. It manages
 * the refresh and storage of the tokens. It stores the tokens in `window.localStorage` if available, and falls back to
 * in-memory storage if not.
 */
export const cognitoUserPoolsTokenProvider =
	new CognitoUserPoolsTokenProvider();

export const { tokenOrchestrator } = cognitoUserPoolsTokenProvider;
