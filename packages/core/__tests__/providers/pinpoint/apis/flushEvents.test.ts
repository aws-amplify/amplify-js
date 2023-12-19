// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getEventBuffer } from '../../../../src/providers/pinpoint/utils/getEventBuffer';
import { flushEvents } from '../../../../src/providers/pinpoint';
import { appId, region, credentials, identityId } from '../testUtils/data';
import {
	BUFFER_SIZE,
	FLUSH_INTERVAL,
	FLUSH_SIZE,
	RESEND_LIMIT,
} from '../../../../src/providers/pinpoint/utils/constants';

jest.mock('../../../../src/providers/pinpoint/utils/getEventBuffer');

describe('Pinpoint Provider API: flushEvents', () => {
	const mockGetEventBuffer = getEventBuffer as jest.Mock;
	const mockFlushAll = jest.fn();
	beforeEach(() => {
		mockGetEventBuffer.mockReturnValue({
			flushAll: mockFlushAll,
		});
	});

	afterEach(() => {
		mockFlushAll.mockReset();
		mockGetEventBuffer.mockReset();
	});

	it('invokes flushAll on pinpoint buffer', () => {
		flushEvents({ appId, region, credentials, identityId });
		expect(mockGetEventBuffer).toHaveBeenCalledWith({
			appId,
			region,
			credentials,
			identityId,
			bufferSize: BUFFER_SIZE,
			flushInterval: FLUSH_INTERVAL,
			flushSize: FLUSH_SIZE,
			resendLimit: RESEND_LIMIT,
		});
		expect(mockFlushAll).toHaveBeenCalledTimes(1);
	});
});
