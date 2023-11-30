// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getEventBuffer,
	resolveConfig,
} from '../../../../src/providers/personalize/utils';
import { resolveCredentials } from '../../../../src/utils';
import {
	mockCredentialConfig,
	mockPersonalizeConfig,
} from '../../../testUtils/mockConstants';
import { flushEvents } from '../../../../src/providers/personalize';
import { ConsoleLogger } from '@aws-amplify/core';

jest.mock('../../../../src/utils');
jest.mock('../../../../src/providers/personalize/utils');

describe('Analytics Personalize API: flushEvents', () => {
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockFlushAll = jest.fn();
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');

	beforeEach(() => {
		mockResolveConfig.mockReturnValue(mockPersonalizeConfig);
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
		const { trackingId, ...configWithoutTrackingId } = mockPersonalizeConfig;
		expect(mockGetEventBuffer).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				...configWithoutTrackingId,
				...mockCredentialConfig,
			})
		);
		expect(mockFlushAll).toHaveBeenCalledTimes(1);
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		flushEvents();
		await new Promise(process.nextTick);
		expect(loggerWarnSpy).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Error)
		);
	});
});
