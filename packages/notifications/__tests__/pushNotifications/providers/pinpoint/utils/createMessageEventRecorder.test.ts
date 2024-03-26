// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { record } from '@aws-amplify/core/internals/providers/pinpoint';
import { resolveCredentials } from '../../../../../src/pushNotifications/utils';
import { getAnalyticsEvent } from '../../../../../src/pushNotifications/providers/pinpoint/utils/getAnalyticsEvent';
import { getChannelType } from '../../../../../src/pushNotifications/providers/pinpoint/utils/getChannelType';
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
	'../../../../../src/pushNotifications/providers/pinpoint/utils/getChannelType',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig',
);
jest.mock('../../../../../src/pushNotifications/utils');

describe('createMessageEventRecorder', () => {
	// assert mocks
	const mockRecord = record as jest.Mock;
	const mockGetAnalyticsEvent = getAnalyticsEvent as jest.Mock;
	const mockGetChannelType = getChannelType as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;

	beforeAll(() => {
		mockGetAnalyticsEvent.mockReturnValue(analyticsEvent);
		mockGetChannelType.mockReturnValue(channelType);
		mockResolveCredentials.mockResolvedValue(credentials);
		mockResolveConfig.mockReturnValue(pinpointConfig);
	});

	afterEach(() => {
		mockRecord.mockReset();
	});

	it('returns message event recorder', () => {
		expect(createMessageEventRecorder('received_background')).toStrictEqual(
			expect.any(Function),
		);
	});

	it('accepts and invokes a callback', done => {
		const callback = jest.fn();
		callback.mockImplementation(() => {
			expect(callback).toHaveBeenCalled();
			done();
		});
		const recorder = createMessageEventRecorder(
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
			const recorder = createMessageEventRecorder('received_background');
			recorder(simplePushMessage);
		});
	});
});
