// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createQueuedStorage } from '@aws-amplify/core';
import { LogParams } from '../../../../src/types';
import {
	CloudWatchLogsClient,
	PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { Reachability } from '@aws-amplify/core/internals/utils';
import { Observable, Observer } from 'rxjs';
import {
	cloudWatchProvider,
	handleRejectedLogEvents,
} from '../../../../src/providers/cloudwatch/client/CloudWatchClient';

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
	let reachabilityObserver: Observer<{ online: boolean }>;

	beforeAll(() => {
		jest
			.spyOn(Reachability.prototype, 'networkMonitor')
			.mockImplementationOnce(() => {
				return new Observable(observer => {
					reachabilityObserver = observer;
				});
			})
			// Twice because we subscribe to get the initial state then again to monitor reachability
			.mockImplementationOnce(() => {
				return new Observable(observer => {
					reachabilityObserver = observer;
				});
			});
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

		it('should not send the logs to cloud watch when the device is offline', async () => {
			CloudWatchLogsClient.prototype.send = jest.fn(
				(command: PutLogEventsCommand) => {
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
					return false;
				});
			await cloudWatchProvider.flushLogs();
			expect(CloudWatchLogsClient.prototype.send).toHaveBeenCalledTimes(0);
		});
	});
	describe('handleRejectedLogEvents', () => {
		let batchedLogs: any[];
		beforeEach(() => {
			batchedLogs = [
				{ content: 'content-0', timestamp: '' },
				{ content: 'content-1', timestamp: '' },
				{ content: 'content-2', timestamp: '' },
				{ content: 'content-3', timestamp: '' },
			];
		});
		it('should delete the rejected tooOld and expired logs from storage: ', async () => {
			handleRejectedLogEvents(batchedLogs, {
				expiredLogEventEndIndex: 1,
				tooOldLogEventEndIndex: 2,
			});
			expect(mockedQueuedStorage.delete).toHaveBeenLastCalledWith(batchedLogs);
		});
		it('should delete all the logs preceding tooNewLogEventStartIndex from storage: ', async () => {
			handleRejectedLogEvents(batchedLogs, {
				tooNewLogEventStartIndex: 2,
			});
			expect(mockedQueuedStorage.delete).toHaveBeenLastCalledWith(
				batchedLogs.slice(2)
			);
		});
	});
});
