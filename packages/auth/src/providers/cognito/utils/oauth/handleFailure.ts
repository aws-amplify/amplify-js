// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../../errors/AuthError';
import { oAuthStore } from './oAuthStore';
import { resolveAndClearInflightPromises } from './inflightPromise';

export const handleFailure = async (
	error: AuthError | unknown
): Promise<void> => {
	resolveAndClearInflightPromises();
	await oAuthStore.clearOAuthInflightData();
	Hub.dispatch(
		'auth',
		{ event: 'signInWithRedirect_failure', data: { error } },
		'Auth',
		AMPLIFY_SYMBOL
	);
};
