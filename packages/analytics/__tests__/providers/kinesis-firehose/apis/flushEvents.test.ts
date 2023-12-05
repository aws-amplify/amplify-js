// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getEventBuffer,
	resolveConfig,
} from '../../../../src/providers/kinesis-firehose/utils';
import { resolveCredentials } from '../../../../src/utils';
import {
	mockKinesisConfig,
	mockCredentialConfig,
} from '../../../testUtils/mockConstants';
import { flushEvents } from '../../../../src/providers/kinesis-firehose/apis';
import { ConsoleLogger } from '@aws-amplify/core';

jest.mock('../../../../src/utils');
jest.mock('../../../../src/providers/kinesis-firehose/utils');

describe('Analytics Kinesis Firehose API: flushEvents', () => {
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockFlushAll = jest.fn();
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');

	beforeEach(() => {
		mockResolveConfig.mockReturnValue(mockKinesisConfig);
		mockResolveCredentials.mockReturnValue(
			Promise.resolve(mockCredentialConfig)
		);
		mockGetEventBuffer.mockImplementation(() => ({
			flushAll: mockFlushAll,
		}));
	});

	afterEach(() => {
		mockResolveConfig.mockReset();
		mockResolveCredentials.mockReset();
		mockFlushAll.mockReset();
		mockGetEventBuffer.mockReset();
	});

	it('trigger flushAll on event buffer', async () => {
		flushEvents();
		await new Promise(process.nextTick);
		expect(mockResolveConfig).toHaveBeenCalledTimes(1);
		expect(mockResolveCredentials).toHaveBeenCalledTimes(1);
		expect(mockGetEventBuffer).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				...mockKinesisConfig,
				...mockCredentialConfig,
			})
		);
		expect(mockFlushAll).toHaveBeenCalledTimes(1);
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		flushEvents();
		await new Promise(process.nextTick);
		expect(loggerWarnSpy).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Error)
		);
	});
});
