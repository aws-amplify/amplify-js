// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { getCurrentUser } from '../apis/getCurrentUser';
import {
	UNEXPECTED_SIGN_IN_INTERRUPTION_EXCEPTION,
	USER_UNAUTHENTICATED_EXCEPTION,
} from '../../../errors/constants';
import { AuthError } from '../../../errors/AuthError';

export const ERROR_MESSAGE =
	'Unable to get user session following successful sign-in.';

export const dispatchSignedInHubEvent = async () => {
	try {
		Hub.dispatch(
			'auth',
			{
				event: 'signedIn',
				data: await getCurrentUser(),
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);
	} catch (error) {
		if ((error as AuthError).name === USER_UNAUTHENTICATED_EXCEPTION) {
			throw new AuthError({
				name: UNEXPECTED_SIGN_IN_INTERRUPTION_EXCEPTION,
				message: ERROR_MESSAGE,
				recoverySuggestion:
					'This most likely is due to auth tokens not being persisted. If you are using cookie store, please ensure cookies can be correctly set from your server.',
			});
		}

		throw error;
	}
};
