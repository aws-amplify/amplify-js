// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingConstraints } from '../../../../src/providers/cloudwatch/types/configuration';
import { setLoggingConstraints } from '../../../../src/providers/cloudwatch/utils/loggingConstraints';

jest.mock('../../../../src/providers/cloudwatch/utils/loggingConstraints');

describe('CloudWatch Logging provider: setUpRemoteConfigurationRefresh()', () => {
	const endpoint = 'https://domain.fakeurl/';
	const loggingConstraints: LoggingConstraints = {
		defaultLogLevel: 'INFO',
		categoryLogLevel: {
			API: 'INFO',
			AUTH: 'INFO',
		},
	};
	const refreshIntervalInSeconds = 5;
	let setUpRemoteConfigurationRefresh;
	// assert mocks
	const mockSetLoggingConstraints = setLoggingConstraints as jest.Mock;
	// create mocks
	const mockFetch = jest.fn();
	const mockResult = { text: jest.fn() };

	beforeAll(() => {
		global['fetch'] = mockFetch;
	});

	beforeEach(() => {
		jest.isolateModules(() => {
			({
				setUpRemoteConfigurationRefresh,
			} = require('../../../../src/providers/cloudwatch/utils/setUpRemoteConfigurationRefresh'));
		});
		mockResult.text.mockResolvedValue(JSON.stringify(loggingConstraints));
		mockFetch.mockResolvedValue(mockResult);
	});

	afterEach(() => {
		jest.useRealTimers();
		mockSetLoggingConstraints.mockClear();
		mockFetch.mockClear();
		mockResult.text.mockReset();
	});

	it('should try to fetch from endpoint immediately', () => {
		setUpRemoteConfigurationRefresh({ endpoint, refreshIntervalInSeconds });
		expect(mockFetch).toHaveBeenCalledWith(endpoint);
	});

	it('should fetch at given intervals', () => {
		jest.useFakeTimers();
		setUpRemoteConfigurationRefresh({ endpoint, refreshIntervalInSeconds });
		expect(mockFetch).toHaveBeenCalledTimes(1);
		jest.advanceTimersByTime(refreshIntervalInSeconds * 1000);
		expect(mockFetch).toHaveBeenCalledTimes(2);
		jest.advanceTimersByTime(refreshIntervalInSeconds * 1000 - 10);
		expect(mockFetch).toHaveBeenCalledTimes(2);
		jest.advanceTimersByTime(10);
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});

	it('should set the fetched logging constraints', async () => {
		setUpRemoteConfigurationRefresh({ endpoint, refreshIntervalInSeconds });
		await new Promise(process.nextTick);
		expect(mockSetLoggingConstraints).toHaveBeenCalledWith(loggingConstraints);
	});

	it('should only maintain one interval', async () => {
		jest.useFakeTimers();
		setUpRemoteConfigurationRefresh({ endpoint, refreshIntervalInSeconds });
		setUpRemoteConfigurationRefresh({ endpoint, refreshIntervalInSeconds });
		expect(mockFetch).toHaveBeenCalledTimes(2);
		jest.advanceTimersByTime(refreshIntervalInSeconds * 1000);
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});

	// TODO: wire up when logging is ready
	// it('should log error on failure', async () => {
	// 	mockResult.text.mockResolvedValue('unparseable-string');
	// 	setUpRemoteConfigurationRefresh({ endpoint, refreshIntervalInSeconds });
	// 	await new Promise(process.nextTick);
	// });
});
