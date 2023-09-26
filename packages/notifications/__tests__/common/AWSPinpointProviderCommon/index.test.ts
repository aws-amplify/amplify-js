// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { Credentials, StorageHelper } from '@aws-amplify/core';
import {
	putEvents,
	updateEndpoint,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';

import { AWSPinpointProviderCommon } from '../../../src/common';

import {
	analyticsEvent,
	awsPinpointConfig,
	credentials,
	userId,
	userInfo,
} from '../../../__mocks__/data';
import { mockLogger, mockStorage } from '../../../__mocks__/mocks';
import { NotificationsSubCategory } from '../../../src/types';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/aws-clients/pinpoint');
jest.mock('../../../src/common/eventListeners');

const SUB_CATEGORY = 'SubCategory';

// TODO(V6) : add back storage helper
// const getStorageSpy = jest.spyOn(StorageHelper.prototype, 'getStorage');

class AWSPinpointProviderTest extends AWSPinpointProviderCommon {
	getSubCategory() {
		return SUB_CATEGORY as NotificationsSubCategory;
	}

	async testRecordAnalyticsEvent(event) {
		await this.recordAnalyticsEvent(event);
	}

	async testInit() {
		await this.init();
	}
}

// TODO(V6) : add back
// const credentialsGetSpy = jest.spyOn(Credentials, 'get');
// const credentialsShearSpy = jest.spyOn(Credentials, 'shear');
const mockPutEvents = putEvents as jest.Mock;
const mockUpdateEndpoint = updateEndpoint as jest.Mock;

describe('AWSPinpoint Common Provider', () => {
	let provider: AWSPinpointProviderTest;
	let mockStorageMemory = {};
	beforeAll(() => {
		mockStorage.setItem.mockImplementation((key, val) => {
			mockStorageMemory[key] = val;
		});
		mockStorage.getItem.mockImplementation(key => mockStorageMemory[key]);
	});
	beforeEach(() => {
		jest.clearAllMocks();
		// getStorageSpy.mockReturnValue(mockStorage);
		// credentialsGetSpy.mockResolvedValue(credentials);
		// credentialsShearSpy.mockImplementation(credentials => credentials);
		mockStorageMemory = {};
		provider = new AWSPinpointProviderTest(mockLogger);
	});

	test('returns the correct category name', () => {
		expect(provider.getCategory()).toBe('Notifications');
	});

	test('returns the correct sub-category name', () => {
		expect(provider.getSubCategory()).toBe(SUB_CATEGORY);
	});

	test('returns the correct provider name', () => {
		expect(provider.getProviderName()).toBe('AWSPinpoint');
	});

	describe('configure', () => {
		test('can be called without input', () => {
			const config = provider.configure();

			expect(config).toMatchObject({});
		});

		test('attaches a storage helper to the config', () => {
			const config = provider.configure(awsPinpointConfig);

			expect(config).toStrictEqual({
				...awsPinpointConfig,
				storage: mockStorage,
			});
		});
	});

	describe('init', () => {
		test('logs an error if init fails', async () => {
			mockStorage.sync.mockImplementationOnce(() => {
				throw new Error();
			});
			// credentialsGetSpy.mockResolvedValue(null);

			await provider.testInit();
			expect(mockLogger.error).toBeCalledWith(
				expect.stringContaining('Failed to initialize'),
				expect.any(Error)
			);
		});
	});

	describe('recordAnalyticsEvent', () => {
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		test('records Pinpoint event', async () => {
			await provider.testRecordAnalyticsEvent(analyticsEvent);

			expect(mockLogger.debug).toBeCalledWith('recording analytics event');
			expect(mockPutEvents).toBeCalled();
		});

		test('throws an error if credentials are empty', async () => {
			// credentialsGetSpy.mockResolvedValue(null);

			await expect(
				provider.testRecordAnalyticsEvent(analyticsEvent)
			).rejects.toThrow();

			expect(mockLogger.debug).toBeCalledWith('no credentials found');
			expect(mockPutEvents).not.toBeCalled();
		});

		test('throws an error on credentials get failure', async () => {
			// credentialsGetSpy.mockImplementation(() => {
			// 	throw new Error();
			// });

			await expect(
				provider.testRecordAnalyticsEvent(analyticsEvent)
			).rejects.toThrow();

			expect(mockLogger.error).toBeCalledWith(
				expect.stringContaining('Error getting credentials'),
				expect.any(Error)
			);
			expect(mockPutEvents).not.toBeCalled();
		});

		test('throws an error on client failure', async () => {
			mockPutEvents.mockImplementationOnce(() => {
				throw new Error();
			});

			await expect(
				provider.testRecordAnalyticsEvent(analyticsEvent)
			).rejects.toThrow();

			expect(mockLogger.error).toBeCalledWith(
				expect.stringContaining('Error recording analytics event'),
				expect.any(Error)
			);
		});
	});

	describe('identifyUser', () => {
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		test('updates Pinpoint endpoint', async () => {
			await provider.identifyUser(userId, userInfo);

			expect(mockLogger.debug).toBeCalledWith('updating endpoint');
			expect(mockUpdateEndpoint).toBeCalled();
		});

		test('throws an error on client failure', async () => {
			mockUpdateEndpoint.mockImplementationOnce(() => {
				throw new Error();
			});

			await expect(provider.identifyUser(userId, userInfo)).rejects.toThrow();

			expect(mockLogger.error).toBeCalledWith(
				expect.stringContaining('Error identifying user'),
				expect.any(Error)
			);
		});
	});
});
