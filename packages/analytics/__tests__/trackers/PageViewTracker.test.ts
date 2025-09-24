// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PageViewTracker } from '../../src/trackers/PageViewTracker';

Object.defineProperty(window, 'location', {
	value: { origin: 'http://localhost:3000', pathname: '/test' },
});
Object.defineProperty(window, 'sessionStorage', {
	value: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
});

describe('PageViewTracker', () => {
	let mockEventRecorder: jest.Mock;

	beforeEach(() => {
		mockEventRecorder = jest.fn();
		jest.clearAllMocks();
	});

	it('should use custom urlProvider when provided', () => {
		const customUrlProvider = jest.fn(() => 'http://localhost:3000/custom');
		(window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

		const tracker = new PageViewTracker(mockEventRecorder, {
			appType: 'multiPage',
			urlProvider: customUrlProvider,
		});

		expect(customUrlProvider).toHaveBeenCalled();
		expect(mockEventRecorder).toHaveBeenCalledWith('pageView', {
			url: 'http://localhost:3000/custom',
		});

		tracker.cleanup();
	});

	it('should use default urlProvider when none provided', () => {
		(window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

		const tracker = new PageViewTracker(mockEventRecorder, {
			appType: 'multiPage',
		});

		expect(mockEventRecorder).toHaveBeenCalledWith('pageView', {
			url: 'http://localhost:3000/test',
		});

		tracker.cleanup();
	});

	it('should preserve custom urlProvider after reconfiguration', () => {
		const customUrlProvider = jest.fn(() => 'http://localhost:3000/custom');
		(window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

		const tracker = new PageViewTracker(mockEventRecorder, {
			urlProvider: customUrlProvider,
		});

		tracker.configure(mockEventRecorder, {
			urlProvider: customUrlProvider,
			appType: 'multiPage',
		});

		expect(customUrlProvider).toHaveBeenCalled();
		expect(mockEventRecorder).toHaveBeenCalledWith('pageView', {
			url: 'http://localhost:3000/custom',
		});

		tracker.cleanup();
	});
});
