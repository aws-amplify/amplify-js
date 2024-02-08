// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingConstraints } from '../../../../src/providers/cloudwatch/types/configuration';
import { setLoggingConstraints } from '../../../../src/providers/cloudwatch/utils/loggingConstraintsHelpers';
import { RemoteLoggingConstraintsRefreshConfiguration } from '../../../../src/providers/cloudwatch/types/configuration';
import { fetchRemoteLoggingConstraints } from '../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraints';

jest.mock(
	'../../../../src/providers/cloudwatch/utils/fetchRemoteLoggingConstraints',
);
jest.mock(
	'../../../../src/providers/cloudwatch/utils/loggingConstraintsHelpers',
);

describe('CloudWatch Logging utils: setUpRemoteLoggingConstraintsRefresh()', () => {
	const endpoint = 'https://domain.fakeurl/';
	const loggingConstraints: LoggingConstraints = {
		defaultLogLevel: 'INFO',
		categoryLogLevel: {
			API: 'INFO',
			AUTH: 'INFO',
		},
	};
	const refreshIntervalInSeconds = 5;
	let setUpRemoteLoggingConstraintsRefresh: (
		configuration: RemoteLoggingConstraintsRefreshConfiguration,
	) => void;
	// assert mocks
	const mockSetLoggingConstraints = setLoggingConstraints as jest.Mock;
	const mockFetchRemoteLoggingConstraints =
		fetchRemoteLoggingConstraints as jest.Mock;

	beforeEach(() => {
		jest.useFakeTimers();
		jest.isolateModules(() => {
			({
				setUpRemoteLoggingConstraintsRefresh,
			} = require('../../../../src/providers/cloudwatch/utils'));
		});
		mockFetchRemoteLoggingConstraints.mockResolvedValue(loggingConstraints);
	});

	afterEach(() => {
		jest.useRealTimers();
		mockSetLoggingConstraints.mockClear();
		mockFetchRemoteLoggingConstraints.mockClear();
	});

	it('should try to fetch from endpoint immediately', () => {
		setUpRemoteLoggingConstraintsRefresh({
			endpoint,
			refreshIntervalInSeconds,
		});
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledWith(endpoint);
	});

	it('should fetch at a default interval', async () => {
		const defaultIntervalInMilliseconds = 1200000;
		setUpRemoteLoggingConstraintsRefresh({ endpoint });
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(1);
		await jest.advanceTimersByTimeAsync(defaultIntervalInMilliseconds);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(2);
		await jest.advanceTimersByTimeAsync(defaultIntervalInMilliseconds - 10);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(2);
		await jest.advanceTimersByTimeAsync(10);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(3);
	});

	it('should fetch at given intervals', async () => {
		setUpRemoteLoggingConstraintsRefresh({
			endpoint,
			refreshIntervalInSeconds,
		});
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(1);
		await jest.advanceTimersByTimeAsync(refreshIntervalInSeconds * 1000);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(2);
		await jest.advanceTimersByTimeAsync(refreshIntervalInSeconds * 1000 - 10);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(2);
		await jest.advanceTimersByTimeAsync(10);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(3);
	});

	it('should set the fetched logging constraints', async () => {
		setUpRemoteLoggingConstraintsRefresh({
			endpoint,
			refreshIntervalInSeconds,
		});
		await jest.runOnlyPendingTimersAsync();
		expect(mockSetLoggingConstraints).toHaveBeenCalledWith(loggingConstraints);
	});

	it('should only maintain one interval', async () => {
		setUpRemoteLoggingConstraintsRefresh({
			endpoint,
			refreshIntervalInSeconds,
		});
		setUpRemoteLoggingConstraintsRefresh({
			endpoint,
			refreshIntervalInSeconds,
		});
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(2);
		await jest.advanceTimersByTimeAsync(refreshIntervalInSeconds * 1000);
		expect(mockFetchRemoteLoggingConstraints).toHaveBeenCalledTimes(3);
	});

	// TODO: wire up when logging is ready
	// it('should log error on failure', async () => {
	// 	setUpRemoteLoggingConstraintsRefresh({ endpoint, refreshIntervalInSeconds });
	// });
});
