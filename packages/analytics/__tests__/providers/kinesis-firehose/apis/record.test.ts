// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getEventBuffer,
	resolveConfig,
} from '../../../../src/providers/kinesis-firehose/utils';
import { isAnalyticsEnabled, resolveCredentials } from '../../../../src/utils';
import {
	mockKinesisConfig,
	mockCredentialConfig,
} from '../../../testUtils/mockConstants';
import { record } from '../../../../src/providers/kinesis-firehose';
import { ConsoleLogger } from '@aws-amplify/core';
import { RecordInput as KinesisFirehoseRecordInput } from '../../../../src/providers/kinesis-firehose/types';

jest.mock('../../../../src/utils');
jest.mock('../../../../src/providers/kinesis-firehose/utils');

describe('Analytics KinesisFirehose API: record', () => {
	const mockRecordInput: KinesisFirehoseRecordInput = {
		streamName: 'stream0',
		data: new Uint8Array([0x01, 0x02, 0xff]),
	};

	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockIsAnalyticsEnabled = isAnalyticsEnabled as jest.Mock;
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockAppend = jest.fn();
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');
	const loggerDebugSpy = jest.spyOn(ConsoleLogger.prototype, 'debug');

	beforeEach(() => {
		mockIsAnalyticsEnabled.mockReturnValue(true);
		mockResolveConfig.mockReturnValue(mockKinesisConfig);
		mockResolveCredentials.mockReturnValue(
			Promise.resolve(mockCredentialConfig),
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
		mockIsAnalyticsEnabled.mockReset();
	});

	it('append to event buffer if record provided', async () => {
		record(mockRecordInput);
		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockAppend).toHaveBeenCalledWith(
			expect.objectContaining({
				region: mockKinesisConfig.region,
				streamName: mockRecordInput.streamName,
				event: mockRecordInput.data,
				retryCount: 0,
			}),
		);
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		record(mockRecordInput);

		await new Promise(process.nextTick);
		expect(loggerWarnSpy).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Error),
		);
	});

	it('logs and skip the event recoding if Analytics plugin is not enabled', async () => {
		mockIsAnalyticsEnabled.mockReturnValue(false);
		record(mockRecordInput);
		await new Promise(process.nextTick);
		expect(loggerDebugSpy).toHaveBeenCalledWith(expect.any(String));
		expect(mockGetEventBuffer).not.toHaveBeenCalled();
		expect(mockAppend).not.toHaveBeenCalled();
	});
});
