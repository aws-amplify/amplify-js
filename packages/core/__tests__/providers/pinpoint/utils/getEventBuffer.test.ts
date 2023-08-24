// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
	appId,
	credentials,
	identityId,
	region,
} from '../testUtils/data';
import { getEventBuffer } from '../../../../src/providers/pinpoint/utils/getEventBuffer';
import { PinpointEventBuffer } from '../../../../src/providers/pinpoint/utils/PinpointEventBuffer';

jest.mock('../../../../src/providers/pinpoint/utils/getCacheKey');
jest.mock('../../../../src/providers/pinpoint/utils/PinpointEventBuffer');

const mockConfig = {
	appId,
	bufferSize: 10,
	credentials,
	flushInterval: 100,
	flushSize: 50,
	identityId,
	region,
	resendLimit: 5
}

describe('Pinpoint Provider Util: bufferManager', () => {
	const mockPinpointEventBuffer = PinpointEventBuffer as jest.Mock;
	const mockIdentityHasChanged = jest.fn();
	const mockFlush = jest.fn();

	beforeEach(() => {
		mockIdentityHasChanged.mockReset();
		mockFlush.mockReset();
		mockPinpointEventBuffer.mockReset();
		mockPinpointEventBuffer.mockImplementation(() => ({
			identityHasChanged: mockIdentityHasChanged,
			flush: mockFlush
		}))
	});

	it('creates a buffer if one doesn\'t exist', async () => {
		const testBuffer = getEventBuffer(mockConfig);

		expect(mockPinpointEventBuffer).toBeCalledWith(mockConfig);
		expect(testBuffer).toBeInstanceOf(Object);
	});

	it('returns an existing buffer instance', () => {
		const testBuffer = getEventBuffer(mockConfig);
		const testBuffer2 = getEventBuffer(mockConfig);

		expect(testBuffer).toBe(testBuffer2);
	});

	it('flushes & creates a new buffer when the identity changes', () => {
		const testBuffer = getEventBuffer(mockConfig);

		mockIdentityHasChanged.mockReturnValue(true);

		const testBuffer2 = getEventBuffer(mockConfig);

		expect(mockFlush).toHaveBeenCalledTimes(1);
		expect(testBuffer).not.toBe(testBuffer2);
	});
});
