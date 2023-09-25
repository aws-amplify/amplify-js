// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getEventBuffer } from '../../../../src/providers/kinesis/utils/getEventBuffer';
import { resolveConfig } from '../../../../src/providers/kinesis/utils/resolveConfig';
import { resolveCredentials } from '../../../../src/providers/kinesis/utils/resolveCredentials';
import {
	mockConfig,
	mockCredentialConfig,
} from '../../../testUtils/mockConstants.test';
import { record } from '../../../../src/providers/kinesis';
import { KinesisEvent } from '../../../../src/providers/kinesis/types';
import { ConsoleLogger as Logger } from '@aws-amplify/core/lib-esm/Logger';
import { AnalyticsValidationErrorCode } from '../../../../src/errors';

jest.mock('../../../../src/providers/kinesis/utils/resolveConfig');
jest.mock('../../../../src/providers/kinesis/utils/resolveCredentials');
jest.mock('../../../../src/providers/kinesis/utils/getEventBuffer');

describe('Analytics Kinesis API: record', () => {
	const mockEvent: KinesisEvent = {
		streamName: 'stream0',
		partitionKey: 'partition0',
		data: new Uint8Array([0x01, 0x02, 0xff]),
	};

	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockAppend = jest.fn();
	const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');

	beforeEach(() => {
		mockResolveConfig.mockReturnValue(mockConfig);
		mockResolveCredentials.mockReturnValue(
			Promise.resolve(mockCredentialConfig)
		);
		mockGetEventBuffer.mockImplementation(() => ({
			append: mockAppend,
		}));
	});

	afterEach(() => {
		mockResolveConfig.mockReset();
		mockResolveCredentials.mockReset();
		mockAppend.mockReset();
		mockGetEventBuffer.mockReset();
	});

	it('append to event buffer if record provided', async () => {
		record(mockEvent);
		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockAppend).toBeCalledWith(
			expect.objectContaining({
				region: mockConfig.region,
				streamName: mockEvent.streamName,
				partitionKey: mockEvent.partitionKey,
				event: mockEvent.data,
				retryCount: 0,
			})
		);
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		record(mockEvent);

		await new Promise(process.nextTick);
		expect(loggerWarnSpy).toBeCalledWith(expect.any(String), expect.any(Error));
	});

	it('throws a validation error when event does not specify a streamName field', () => {
		const mockParams = {
			...mockEvent,
			streamName: undefined,
		};

		try {
			record(mockParams as KinesisEvent);
		} catch (e) {
			expect(e.name).toEqual(AnalyticsValidationErrorCode.NoStreamName);
		}

		expect.assertions(1);
	});

	it('throws a validation error when event does not specify a partitionKey field', () => {
		const mockParams = {
			...mockEvent,
			partitionKey: undefined,
		};

		try {
			record(mockParams as KinesisEvent);
		} catch (e) {
			expect(e.name).toEqual(AnalyticsValidationErrorCode.NoPartitionKey);
		}

		expect.assertions(1);
	});

	it('throws a validation error when event does not specify a data field', () => {
		const mockParams = {
			...mockEvent,
			data: undefined,
		};

		try {
			record(mockParams as KinesisEvent);
		} catch (e) {
			expect(e.name).toEqual(AnalyticsValidationErrorCode.NoData);
		}

		expect.assertions(1);
	});
});
