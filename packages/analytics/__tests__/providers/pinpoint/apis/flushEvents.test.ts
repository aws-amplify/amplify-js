// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	resolveConfig,
	resolveCredentials,
} from '../../../../src/providers/pinpoint/utils';
import { config, credentials, identityId } from './testUtils/data';
import { flushEvents } from '../../../../src';
import { flushEvents as pinpointFlushEvents } from '@aws-amplify/core/internals/providers/pinpoint';
import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';
import { getAnalyticsUserAgentString } from '../../../../src/utils';

jest.mock('../../../../src/providers/pinpoint/utils');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');

describe('Pinpoint API: flushEvents', () => {
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockPinpointFlushEvents = pinpointFlushEvents as jest.Mock;
	const loggerWarnSpy = jest.spyOn(ConsoleLogger.prototype, 'warn');

	beforeEach(() => {
		mockResolveConfig.mockReturnValue(config);
		mockResolveCredentials.mockReturnValue(
			Promise.resolve({
				credentials,
				identityId,
			})
		);
	});

	afterEach(() => {
		mockResolveConfig.mockReset();
		mockResolveCredentials.mockReset();
		mockPinpointFlushEvents.mockReset();
	});

	it('invokes the core flushEvents implementation', async () => {
		flushEvents();

		expect(mockResolveConfig).toHaveBeenCalledTimes(1);
		expect(mockResolveCredentials).toHaveBeenCalledTimes(1);

		await new Promise(process.nextTick);
		expect(mockPinpointFlushEvents).toHaveBeenCalledWith({
			...config,
			credentials,
			identityId,
			userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
		});
	});

	it('logs an error when credentials can not be fetched', async () => {
		mockResolveCredentials.mockRejectedValue(new Error('Mock Error'));

		flushEvents();

		await new Promise(process.nextTick);

		expect(mockPinpointFlushEvents).not.toHaveBeenCalled();
		expect(loggerWarnSpy).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Error)
		);
	});
});
