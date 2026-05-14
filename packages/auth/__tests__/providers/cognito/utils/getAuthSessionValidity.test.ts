// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DEFAULT_AUTH_SESSION_VALIDITY_MS,
	getAuthSessionValidity,
} from '../../../../src/providers/cognito/utils/getAuthSessionValidity';

jest.mock(
	'@aws-amplify/core',
	() => ({
		Amplify: {
			getConfig: jest.fn(),
		},
	}),
	{ virtual: true },
);

describe('getAuthSessionValidity()', () => {
	const mockGetConfig = (
		jest.requireMock('@aws-amplify/core') as {
			Amplify: { getConfig: jest.Mock };
		}
	).Amplify.getConfig;

	afterEach(() => {
		mockGetConfig.mockReset();
	});

	it('returns the default Cognito auth session validity when not configured', () => {
		mockGetConfig.mockReturnValue({} as any);

		expect(getAuthSessionValidity()).toBe(
			DEFAULT_AUTH_SESSION_VALIDITY_MS,
		);
	});

	it('returns configured Cognito auth session validity in milliseconds', () => {
		mockGetConfig.mockReturnValue({
			Auth: {
				Cognito: {
					userPoolId: 'us-west-2_test',
					userPoolClientId: 'clientId',
					authSessionValidity: 15,
				},
			},
		});

		expect(getAuthSessionValidity()).toBe(15 * 60 * 1000);
	});

	it('bounds configured Cognito auth session validity to the Cognito range', () => {
		mockGetConfig.mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolId: 'us-west-2_test',
					userPoolClientId: 'clientId',
					authSessionValidity: 2,
				},
			},
		});
		expect(getAuthSessionValidity()).toBe(3 * 60 * 1000);

		mockGetConfig.mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolId: 'us-west-2_test',
					userPoolClientId: 'clientId',
					authSessionValidity: 16,
				},
			},
		});
		expect(getAuthSessionValidity()).toBe(15 * 60 * 1000);
	});
});
