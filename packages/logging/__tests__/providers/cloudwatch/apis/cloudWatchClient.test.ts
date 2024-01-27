// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloudWatchProvider } from '../../../../src/providers/cloudwatch';
import { createQueuedStorage, QueuedStorage } from '@aws-amplify/core';
import { LogParams } from '../../../../src/types';
import {
	CloudWatchLogsClient,
	PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { Reachability } from '@aws-amplify/core/internals/utils';
const mockedQueuedStorage = {
	add: jest.fn(),
	isFull: jest.fn(),
	peekAll: jest.fn(),
	delete: jest.fn(),
};
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	createQueuedStorage: jest.fn(() => mockedQueuedStorage),
}));
const mockCreateQueuedStorage = createQueuedStorage as jest.Mock;

describe('Cloudwatch provider APIs:', () => {
	let testLog: LogParams = {
		logLevel: 'INFO',
		message: 'test-message-1',
		namespace: 'test-namespace',
		category: 'Auth',
	};
	const intendedLogMessageFormat = `[${testLog.logLevel}] ${testLog.namespace}/${testLog.category}: ${testLog.message}`;
	beforeAll(() => {
		cloudWatchProvider.configure({
			region: 'us-test-1',
			logGroupName: 'test-group-name',
		});
	});
	afterEach(() => {
		mockedQueuedStorage.add.mockReset();
	});
	describe('log', () => {
		it('should add given log to local storage', () => {
			expect(mockCreateQueuedStorage).toHaveBeenCalled();
			mockedQueuedStorage.isFull.mockReturnValue(false);
			cloudWatchProvider.log(testLog);
			expect(mockedQueuedStorage.add).toHaveBeenCalledWith(
				expect.objectContaining({
					content: expect.stringContaining(testLog.message),
				}),
				{ dequeueBeforeEnqueue: false }
			);
		});
		it('should store the intented log message format', () => {
			expect(mockCreateQueuedStorage).toHaveBeenCalled();
			mockedQueuedStorage.isFull.mockReturnValue(false);
			cloudWatchProvider.log(testLog);
			expect(mockedQueuedStorage.add).toHaveBeenCalledWith(
				expect.objectContaining({ content: intendedLogMessageFormat }),
				{ dequeueBeforeEnqueue: false }
			);
		});
	});
	describe('flushLogs', () => {
		it('should flush the logs to cloud watch given the device is online', async () => {
			expect.assertions(4);

			CloudWatchLogsClient.prototype.send = jest.fn(
				(command: PutLogEventsCommand) => {
					expect(command.input.logEvents).toBeDefined();
					expect(command.input.logEvents![0].message).toEqual(
						intendedLogMessageFormat
					);
					return Promise.resolve({
						rejectedLogEventsInfo: undefined,
					});
				}
			);
			expect(mockCreateQueuedStorage).toHaveBeenCalled();
			mockedQueuedStorage.peekAll.mockReturnValue([
				{
					content: intendedLogMessageFormat,
					timestamp: new Date().getTime().toString(),
				},
			]);
			jest
				.spyOn(Reachability.prototype, 'isOnline')
				.mockImplementationOnce(() => {
					return true;
				});
			await cloudWatchProvider.flushLogs();
			expect(mockedQueuedStorage.delete).toHaveBeenCalledTimes(1);
		});
	});
	describe('_sendToCloudWatch', () => {
		it('should handle rejected tooOld log events: ', async () => {});
	});
});
