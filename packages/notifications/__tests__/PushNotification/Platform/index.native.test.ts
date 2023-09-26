// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform } from '../../../src/pushNotifications/Platform/index.native';

jest.mock('react-native', () => ({
	Platform: { OS: 'test-os' },
}));

describe('Platform', () => {
	test('returns react native platform', () => {
		expect(Platform.OS).toBe('test-os');
	});
});
