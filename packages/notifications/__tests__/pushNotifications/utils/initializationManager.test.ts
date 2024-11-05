// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	initialize,
	isInitialized,
} from '../../../src/pushNotifications/utils/initializationManager';

describe('initializationManager', () => {
	it('is not initialized to start', () => {
		expect(isInitialized()).toBe(false);
	});

	it('can initialize', () => {
		initialize();
		expect(isInitialized()).toBe(true);
	});
});
