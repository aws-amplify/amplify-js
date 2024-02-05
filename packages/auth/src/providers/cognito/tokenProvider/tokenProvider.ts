// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolsTokenProvider } from './CognitoUserPoolsTokenProvider';

export const cognitoUserPoolsTokenProvider =
	new CognitoUserPoolsTokenProvider();

export const tokenOrchestrator =
	cognitoUserPoolsTokenProvider.tokenOrchestrator;
