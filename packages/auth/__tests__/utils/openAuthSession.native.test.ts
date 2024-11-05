// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { openAuthSession } from '../../src/utils/openAuthSession.native';

jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyWebBrowser: jest.fn(() => ({
		openAuthSessionAsync: mockOpenAuthSessionAsync,
	})),
}));

// module level mocks
const mockOpenAuthSessionAsync = jest.fn();

describe('openAuthSession (native)', () => {
	const url = 'https://example.com';
	const redirectUrl = 'scheme://oauth/';

	afterEach(() => {
		mockOpenAuthSessionAsync.mockReset();
	});

	it('opens an auth session successfully', async () => {
		mockOpenAuthSessionAsync.mockResolvedValue(redirectUrl);
		expect(await openAuthSession(url, [redirectUrl])).toStrictEqual({
			type: 'success',
			url: redirectUrl,
		});
	});

	it('returns a canceled result type', async () => {
		mockOpenAuthSessionAsync.mockResolvedValue(null);
		expect(await openAuthSession(url, [redirectUrl])).toStrictEqual({
			type: 'canceled',
		});
	});

	it('returns an error result type', async () => {
		mockOpenAuthSessionAsync.mockRejectedValue(new Error());
		expect(await openAuthSession(url, [redirectUrl])).toStrictEqual({
			type: 'error',
			error: expect.any(Error),
		});
	});
});
