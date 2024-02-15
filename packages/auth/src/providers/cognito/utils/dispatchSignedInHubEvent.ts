// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { getCurrentUser } from '../apis/getCurrentUser';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';
import {
	UNEXPECTED_SIGN_IN_INTERRUPTION_EXCEPTION,
	USER_UNAUTHENTICATED_EXCEPTION,
} from '../../../errors/constants';
import { AuthError } from '../../../errors/AuthError';

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
				message:
					'Could not get user session right after signing in successfully.',
				recoverySuggestion:
					'This most likely is due to the auth tokens cannot be persisted. If you are using cookie store, please check if cookies can be correctly set from your server.',
			});
		}

		throw error;
	}
};
