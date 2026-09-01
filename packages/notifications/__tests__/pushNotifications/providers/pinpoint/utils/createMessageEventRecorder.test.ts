// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { record } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { resolveCredentials } from '../../../../../src/pushNotifications/utils';
import { getAnalyticsEvent } from '../../../../../src/pushNotifications/providers/pinpoint/utils/getAnalyticsEvent';
import { getChannelType } from '../../../../../src/pushNotifications/providers/shared/utils/getChannelType';
import { resolveConfig } from '../../../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig';
import { createMessageEventRecorder } from '../../../../../src/pushNotifications/providers/pinpoint/utils/createMessageEventRecorder';
import {
	analyticsEvent,
	channelType,
	credentials,
	pinpointConfig,
	simplePushMessage,
} from '../../../../testUtils/data';

jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
}));
jest.mock(
	'../../../../../src/pushNotifications/providers/pinpoint/utils/getAnalyticsEvent',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/shared/utils/getChannelType',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig',
);
jest.mock('../../../../../src/pushNotifications/utils');

describe('createMessageEventRecorder', () => {
	// assert mocks
	const mockCtx = createMockAmplifyContext();
	const mockRecord = record as jest.Mock;
	const mockGetAnalyticsEvent = getAnalyticsEvent as jest.Mock;
	const mockGetChannelType = getChannelType as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;

	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
		mockGetAnalyticsEvent.mockReturnValue(analyticsEvent);
		mockGetChannelType.mockReturnValue(channelType);
		mockResolveCredentials.mockResolvedValue(credentials);
		mockResolveConfig.mockReturnValue(pinpointConfig);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	afterEach(() => {
		mockRecord.mockReset();
	});

	it('returns message event recorder', () => {
		expect(
			createMessageEventRecorder(mockCtx, 'received_background'),
		).toStrictEqual(expect.any(Function));
	});

	it('accepts and invokes a callback', done => {
		const callback = jest.fn();
		callback.mockImplementation(() => {
			expect(callback).toHaveBeenCalled();
			done();
		});
		const recorder = createMessageEventRecorder(
			mockCtx,
			'received_background',
			callback,
		);
		recorder(simplePushMessage);
	});

	describe('created message event recorder', () => {
		it('records a message event', done => {
			mockRecord.mockImplementation(() => {
				expect(mockRecord).toHaveBeenCalledWith(
					expect.objectContaining({ event: analyticsEvent }),
				);
				done();
			});
			const recorder = createMessageEventRecorder(
				mockCtx,
				'received_background',
			);
			recorder(simplePushMessage);
		});
	});

	describe('getter re-resolution', () => {
		it('resolves context per invocation when a getter is provided', done => {
			const ctxA = createMockAmplifyContext();
			const ctxB = createMockAmplifyContext();
			let callCount = 0;
			const ctxGetter = () => {
				callCount += 1;

				return callCount === 1 ? ctxA : ctxB;
			};

			const recorder = createMessageEventRecorder(
				ctxGetter,
				'received_background',
			);

			let recordCallCount = 0;
			mockRecord.mockImplementation(() => {
				recordCallCount += 1;
				if (recordCallCount === 1) {
					expect(mockResolveCredentials).toHaveBeenCalledWith(ctxA);
					expect(mockResolveConfig).toHaveBeenCalledWith(ctxA);
					mockResolveCredentials.mockClear();
					mockResolveConfig.mockClear();
					// Invoke recorder a second time
					recorder(simplePushMessage);
				} else {
					expect(mockResolveCredentials).toHaveBeenCalledWith(ctxB);
					expect(mockResolveConfig).toHaveBeenCalledWith(ctxB);
					done();
				}
			});

			recorder(simplePushMessage);
		});
	});
});
