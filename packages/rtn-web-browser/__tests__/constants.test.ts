// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PACKAGE_NAME } from '../src/constants';

jest.mock('react-native', () => ({
	Platform: {
		select: jest.fn(),
	},
}));

// const mockPlatformSelect = require('react-native').Platform.select;

describe('constants', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('exports correct package name', () => {
		expect(PACKAGE_NAME).toBe('@aws-amplify/rtn-web-browser');
	});

	it('generates iOS-specific linking error', () => {
		// Re-mock after resetModules
		jest.resetModules();
		jest.doMock('react-native', () => ({
			Platform: {
				select: jest.fn().mockReturnValue("- You have run 'pod install'\n"),
			},
		}));

		const { LINKING_ERROR: freshLinkingError } = require('../src/constants');

		expect(freshLinkingError).toContain('pod install');
		expect(freshLinkingError).toContain('@aws-amplify/rtn-web-browser');
		expect(freshLinkingError).toContain('rebuilt the app');
		expect(freshLinkingError).toContain('not using Expo Go');
	});

	it('generates generic linking error for other platforms', () => {
		// Re-mock after resetModules
		jest.resetModules();
		jest.doMock('react-native', () => ({
			Platform: {
				select: jest.fn().mockReturnValue(''),
			},
		}));

		const { LINKING_ERROR: freshLinkingError } = require('../src/constants');

		expect(freshLinkingError).toContain('rebuilt the app');
		expect(freshLinkingError).toContain('@aws-amplify/rtn-web-browser');
		expect(freshLinkingError).not.toContain('pod install');
	});
});
