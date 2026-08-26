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
import type { AuthTokenStore } from '../tokenProvider/types';

export const ERROR_MESSAGE =
	'Unable to get user session following successful sign-in.';

export const dispatchSignedInHubEvent = async (
	tokenStore: AuthTokenStore,
	username: string,
) => {
	try {
		// Capture the RAW active pointer BEFORE adding the new active session so we
		// can distinguish activating from no-active-user (first sign-in OR a parked
		// roster after sign-out), a genuine active-user switch, and the active user
		// simply re-authenticating. A parked-only roster reads as no active pointer.
		const activePointer = await tokenStore.getActiveUsername();
		// Add/promote the signed-in user to the front of the roster AND set the
		// active pointer BEFORE resolving the payload so getLastAuthUser reflects
		// the new active user.
		await tokenStore.addActiveSession(username);

		const currentUser = await getCurrentUser();
		const data = {
			username: currentUser.username,
			userId: currentUser.userId,
		};

		// userSignedIn tracks the specific user signing in and fires on every sign-in.
		Hub.dispatch(
			'auth',
			{
				event: 'userSignedIn',
				data,
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);

		if (!activePointer) {
			// no active user before (empty pointer: first sign-in or activating a
			// parked session after sign-out) -> emit the signedIn boundary event.
			Hub.dispatch(
				'auth',
				{
					event: 'signedIn',
					data,
				},
				'Auth',
				AMPLIFY_SYMBOL,
			);
		} else if (activePointer !== username) {
			// a different user was active -> the active pointer moved between users.
			Hub.dispatch(
				'auth',
				{
					event: 'switchActiveUser',
					data,
				},
				'Auth',
				AMPLIFY_SYMBOL,
			);
		}
		// else the already-active user re-authenticated: neither signedIn nor
		// switchActiveUser is a meaningful boundary, so dispatch neither.
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
