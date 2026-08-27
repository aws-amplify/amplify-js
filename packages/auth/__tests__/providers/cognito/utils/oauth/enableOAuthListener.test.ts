// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { clearGlobalContext } from '@aws-amplify/core/internals/utils';

import { attemptCompleteOAuthFlow } from '../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow';
import { mockAuthConfigWithOAuth } from '../../../../mockData';

// Registers the `configure` Hub side effect at module load. Imported for its
// side effect only; the jest.mock calls below are hoisted above imports, so the
// module observes the mocked `isBrowser`/`attemptCompleteOAuthFlow`.
import '../../../../../src/providers/cognito/utils/oauth/enableOAuthListener';

// Phase C4: the listener is driven by the real `configure` Hub event published
// by `Amplify.configure()` (which sets the global context first). Per repo
// convention only the boundaries are mocked — `isBrowser` (so the browser-only
// side effect registers) and `attemptCompleteOAuthFlow` (the completion
// boundary). The real core singleton, config, and Hub are exercised.
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => true),
}));
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow',
);

const mockAttemptCompleteOAuthFlow = attemptCompleteOAuthFlow as jest.Mock;

describe('enableOAuthListener', () => {
	afterEach(() => {
		jest.clearAllMocks();
		clearGlobalContext();
	});

	it('completes the inflight OAuth flow after Amplify.configure() with an OAuth-enabled Cognito config', () => {
		Amplify.configure(mockAuthConfigWithOAuth);

		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledTimes(1);
		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledWith(
			expect.objectContaining({
				loginWith: expect.objectContaining({
					oauth: expect.objectContaining({ domain: 'oauth.domain.com' }),
				}),
			}),
		);
	});

	it('does not attempt completion when configured without OAuth', () => {
		Amplify.configure({
			Auth: {
				Cognito: {
					userPoolId: 'userPoolId',
					userPoolClientId: 'userPoolClientId',
				},
			},
		});

		expect(mockAttemptCompleteOAuthFlow).not.toHaveBeenCalled();
	});
});
