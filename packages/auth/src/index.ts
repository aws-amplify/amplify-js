// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoHostedUIIdentityProvider,
	SignUpParams,
	GRAPHQL_AUTH_MODE,
} from './types/Auth';
import { AuthErrorStrings } from './common/AuthErrorStrings';

export {
	CognitoHostedUIIdentityProvider,
	SignUpParams,
	AuthErrorStrings,
	GRAPHQL_AUTH_MODE,
};

// Default provider APIs & types
export * from './providers/cognito';

export { fetchAuthSession } from '@aws-amplify/core';
