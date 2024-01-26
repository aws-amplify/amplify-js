// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloudWatchProvider } from '../../../../src/providers/cloudwatch';
import { createQueuedStorage, QueuedStorage } from '@aws-amplify/core';
import { LogParams } from '../../../../src/types';
import {
	CloudWatchLogsClient,
} from '@aws-sdk/client-cloudwatch-logs';
import { Reachability } from '@aws-amplify/core/internals/utils';
const mockedQueuedStorage = {
	add: jest.fn(),
	isFull: jest.fn(),
	peekAll: jest.fn()
}
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	createQueuedStorage: jest.fn(()=>mockedQueuedStorage),
}));
const mockCreateQueuedStorage = createQueuedStorage as jest.Mock;
                     

// const mockCloudWatchLogsClient = jest.fn().mockImplementation(() => {
// 	return mockCWClientInstance;
//   });
// CloudWatchLogsClient.prototype.send = jest.fn((command) => {
// 	return Promise.resolve({});
// });
const mockCWClientSend = jest.fn(); 
jest.mock('@aws-sdk/client-cloudwatch-logs', () => ({
	__esModule: true,
	// ...jest.requireActual('@aws-sdk/client-cloudwatch-logs'),
	CloudWatchLogsClient: jest.fn().mockImplementation((param) => {
        return {
			send: mockCWClientSend
        }
    }),
	PutLogEventsCommand: jest.fn().mockImplementation((param) => {
        return {
        }
    })

}));

describe('Cloudwatch provider APIs:', () => {
	const testLog: LogParams = {logLevel:'INFO', message: 'test-message-1',namespace:'test-namespace', category:'Auth'}
	const intendedLogMessageFormat = `[${testLog.logLevel}] ${testLog.namespace}/${testLog.category}: ${testLog.message}`
	beforeAll(()=>{
		cloudWatchProvider.configure({region: 'us-test-1', logGroupName:'test-group-name'})
	});
	afterEach(()=>{
		mockedQueuedStorage.add.mockReset()
	})
	describe('log', () => {
	it('should add given log to local storage', () => {
		expect(mockCreateQueuedStorage).toHaveBeenCalled();
		mockedQueuedStorage.isFull.mockReturnValue(false)
		cloudWatchProvider.log(testLog)
		expect(mockedQueuedStorage.add).toHaveBeenCalledWith(expect.objectContaining({content: expect.stringContaining(testLog.message)}), {dequeueBeforeEnqueue: false});
	});
	it('should store the intented log message format', () => {
		expect(mockCreateQueuedStorage).toHaveBeenCalled();
		mockedQueuedStorage.isFull.mockReturnValue(false)
		cloudWatchProvider.log(testLog)
		expect(mockedQueuedStorage.add).toHaveBeenCalledWith(expect.objectContaining({content: intendedLogMessageFormat}), {dequeueBeforeEnqueue: false});
	});
});
	describe('flushLogs', () => {
		it('should flush the logs to cloud watch given the device is online', () => {
			// const cwClientSpy = jest.spyOn(CloudWatchLogsClient.prototype, 'send');

			expect(mockCreateQueuedStorage).toHaveBeenCalled();
			mockedQueuedStorage.peekAll.mockReturnValue([{content: intendedLogMessageFormat, timestamp: new Date().getTime().toString()}])
			jest
			.spyOn(Reachability.prototype, 'isOnline')
			.mockImplementationOnce(() => {
				return true;
			});
			cloudWatchProvider.flushLogs()
			// TODO: Unable to mock send and test if it was sent. 
			// expect(mockCWClientSend).toHaveBeenCalled();
			
		});
		
		// TODO: add test to check the right format is stored
	});
});
