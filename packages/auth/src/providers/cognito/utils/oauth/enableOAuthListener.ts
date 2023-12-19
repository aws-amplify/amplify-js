// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	ADD_OAUTH_LISTENER,
	isBrowser,
} from '@aws-amplify/core/internals/utils';
import { cognitoUserPoolsTokenProvider } from '../../tokenProvider';
import { oAuthStore } from './oAuthStore';
import { addInflightPromise } from './inflightPromise';
import { attemptCompleteOAuthFlow } from './attemptCompleteOAuthFlow';

// attach the side effect for handling the completion of an inflight oauth flow
isBrowser() &&
	(() => {
		// add the listener to the singleton for triggering
		Amplify[ADD_OAUTH_LISTENER](attemptCompleteOAuthFlow);

		cognitoUserPoolsTokenProvider.setWaitForInflightOAuth(
			() =>
				new Promise(async (res, _rej) => {
					if (!(await oAuthStore.loadOAuthInFlight())) {
						res();
					} else {
						addInflightPromise(res);
					}
				})
		);
	})();

// required to present for module loaders
export {};
