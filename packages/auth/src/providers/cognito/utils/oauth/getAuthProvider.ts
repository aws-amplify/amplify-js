// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoAuthProvider, SignInWithRedirectInput } from '../../types';

export const getCognitoAuthProvider = (
	provider?: SignInWithRedirectInput['provider'],
): CognitoAuthProvider => {
	const defaultProvider = 'Cognito';
	if (typeof provider === 'string') return provider;
	else if (provider?.custom) return provider.custom;

	return defaultProvider;
};
