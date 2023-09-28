// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { openAuthSession } from '../../src/utils/openAuthSession.native';
import { AmplifyRTNWebBrowser } from '@aws-amplify/rtn-web-browser';

jest.mock('@aws-amplify/rtn-web-browser', () => ({
	AmplifyRTNWebBrowser: {
		openAuthSessionAsync: jest.fn(),
	},
}));

describe('openAuthSession (native)', () => {
	const url = 'https://example.com';
	const redirectUrl = 'scheme://oauth/';
	// create mocks
	const mockOpenAuthSessionAsync =
		AmplifyRTNWebBrowser.openAuthSessionAsync as jest.Mock;

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

	it('returns an unknown result type', async () => {
		mockOpenAuthSessionAsync.mockRejectedValue(new Error());
		expect(await openAuthSession(url, [redirectUrl])).toStrictEqual({
			type: 'unknown',
		});
	});
});
