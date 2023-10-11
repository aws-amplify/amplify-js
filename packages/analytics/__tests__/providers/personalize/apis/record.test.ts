// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	autoTrackMedia,
	getEventBuffer,
	resolveCachedSession,
	resolveConfig,
	updateCachedSession,
} from '../../../../src/providers/personalize/utils';
import { isAnalyticsEnabled, resolveCredentials } from '../../../../src/utils';
import {
	mockCredentialConfig,
	mockPersonalizeConfig,
} from '../../../testUtils/mockConstants.test';
import { record } from '../../../../src/providers/personalize';
import { Logger } from '@aws-amplify/core';
import { RecordInput as PersonalizeRecordInput } from '../../../../src/providers/personalize/types';
import {
	IDENTIFY_EVENT_TYPE,
	MEDIA_AUTO_TRACK_EVENT_TYPE,
} from '../../../../src/providers/personalize/utils/constants';

jest.mock('../../../../src/utils');
jest.mock('../../../../src/providers/personalize/utils');

describe('Analytics Personalize API: record', () => {
	const mockRecordInput: PersonalizeRecordInput = {
		eventType: 'eventType0',
		properties: {
			property0: 0,
			property1: '1',
		},
	};

	const mockCachedSession = {
		sessionId: 'sessionId0',
		userId: 'userId0',
	};

	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockIsAnalyticsEnabled = isAnalyticsEnabled as jest.Mock;
	const mockResolveCachedSession = resolveCachedSession as jest.Mock;
	const mockUpdateCachedSession = updateCachedSession as jest.Mock;
	const mockAutoTrackMedia = autoTrackMedia as jest.Mock;
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockAppend = jest.fn();
	const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');
	const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');
	const mockEventBuffer = {
		append: mockAppend,
	};
	beforeEach(() => {
		mockIsAnalyticsEnabled.mockReturnValue(true);
		mockResolveConfig.mockReturnValue(mockPersonalizeConfig);
		mockResolveCachedSession.mockReturnValue(mockCachedSession);
		mockResolveCredentials.mockReturnValue(
			Promise.resolve(mockCredentialConfig)
		);
		mockGetEventBuffer.mockImplementation(() => mockEventBuffer);
	});

	afterEach(() => {
		mockResolveConfig.mockReset();
		mockResolveCredentials.mockReset();
		mockResolveCachedSession.mockReset();
		mockUpdateCachedSession.mockReset();
		mockAutoTrackMedia.mockReset();
		mockAppend.mockReset();
		mockGetEventBuffer.mockReset();
		mockIsAnalyticsEnabled.mockReset();
	});

	it('append to event buffer if record provided', async () => {
		record(mockRecordInput);
		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockAppend).toBeCalledWith(
			expect.objectContaining({
				trackingId: mockPersonalizeConfig.trackingId,
				...mockCachedSession,
				event: mockRecordInput,
			})
		);
	});

	it('triggers updateCachedSession if eventType is identity event', async () => {
		const newSession = {
			sessionId: 'sessionId1',
			userId: 'userId1',
		};
		mockResolveCachedSession
			.mockReturnValueOnce(mockCachedSession)
			.mockReturnValueOnce(newSession);

		const updatedMockRecordInput = {
			...mockRecordInput,
			eventType: IDENTIFY_EVENT_TYPE,
			properties: {
				...mockRecordInput.properties,
				userId: newSession.userId,
			},
		};
		record(updatedMockRecordInput);

		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockUpdateCachedSession).toBeCalledWith(
			newSession.userId,
			mockCachedSession.sessionId,
			mockCachedSession.userId
		);
		expect(mockAppend).toBeCalledWith(
			expect.objectContaining({
				trackingId: mockPersonalizeConfig.trackingId,
				...newSession,
				event: updatedMockRecordInput,
			})
		);
	});

	it('triggers updateCachedSession if userId is non-empty in RecordInput', async () => {
		const newSession = {
			sessionId: 'sessionId1',
			userId: 'userId1',
		};
		mockResolveCachedSession
			.mockReturnValueOnce(mockCachedSession)
			.mockReturnValueOnce(newSession);

		const updatedMockRecordInput = {
			...mockRecordInput,
			userId: newSession.userId,
		};
		record(updatedMockRecordInput);

		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockUpdateCachedSession).toBeCalledWith(
			newSession.userId,
			mockCachedSession.sessionId,
			mockCachedSession.userId
		);
		expect(mockAppend).toBeCalledWith(
			expect.objectContaining({
				trackingId: mockPersonalizeConfig.trackingId,
				...newSession,
				event: mockRecordInput,
			})
		);
	});

	it(`triggers autoTrackMedia if eventType is ${MEDIA_AUTO_TRACK_EVENT_TYPE}`, async () => {
		const updatedMockRecordInput = {
			...mockRecordInput,
			eventType: MEDIA_AUTO_TRACK_EVENT_TYPE,
		};
		record(updatedMockRecordInput);

		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockAutoTrackMedia).toBeCalledWith(
			{
				trackingId: mockPersonalizeConfig.trackingId,
				...mockCachedSession,
				event: updatedMockRecordInput,
			},
			mockEventBuffer
		);
		expect(mockAppend).not.toBeCalled();
	});

	it('flushEvents when buffer size is full', async () => {
		const mockFlushAll = jest.fn();
		const mockGetLength = jest.fn();
		const updatedMockEventBuffer = {
			...mockEventBuffer,
			flushAll: mockFlushAll,
		};
		Object.defineProperty(updatedMockEventBuffer, 'length', {
			get: mockGetLength,
		});

		mockGetLength.mockReturnValue(mockPersonalizeConfig.flushSize + 1);
		mockGetEventBuffer.mockImplementation(() => updatedMockEventBuffer);

		record(mockRecordInput);
		await new Promise(process.nextTick);
		expect(mockGetEventBuffer).toHaveBeenCalledTimes(1);
		expect(mockAppend).toBeCalledWith(
			expect.objectContaining({
				trackingId: mockPersonalizeConfig.trackingId,
				...mockCachedSession,
				event: mockRecordInput,
			})
		);
		expect(mockGetLength).toHaveBeenCalledTimes(1);
		expect(mockFlushAll).toHaveBeenCalledTimes(1);
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		record(mockRecordInput);

		await new Promise(process.nextTick);
		expect(loggerWarnSpy).toBeCalledWith(expect.any(String), expect.any(Error));
	});

	it('logs and skip the event recoding if Analytics plugin is not enabled', async () => {
		mockIsAnalyticsEnabled.mockReturnValue(false);
		record(mockRecordInput);
		await new Promise(process.nextTick);
		expect(loggerDebugSpy).toBeCalledWith(expect.any(String));
		expect(mockGetEventBuffer).not.toBeCalled();
		expect(mockAppend).not.toBeCalled();
	});
});
