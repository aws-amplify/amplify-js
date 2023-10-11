// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../../src/providers/kinesis/utils/resolveConfig';
import { resolveCredentials } from '../../../../src/utils';
import {
	mockKinesisConfig,
	mockCredentialConfig,
} from '../../../testUtils/mockConstants.test';
import { getEventBuffer } from '../../../../src/providers/kinesis/utils/getEventBuffer';
import { flushEvents } from '../../../../src/providers/kinesis/apis';
import { Logger } from '@aws-amplify/core';

jest.mock('../../../../src/utils');
jest.mock('../../../../src/providers/kinesis/utils/getEventBuffer');
jest.mock('../../../../src/providers/kinesis/utils/resolveConfig');

describe('Analytics Kinesis API: flushEvents', () => {
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockFlushAll = jest.fn();
	const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');

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
		expect(loggerWarnSpy).toBeCalledWith(expect.any(String), expect.any(Error));
	});
});
