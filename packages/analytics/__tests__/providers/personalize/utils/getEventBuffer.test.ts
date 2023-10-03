// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBuffer } from '../../../../src/utils';
import {
	mockBufferConfig,
	mockKinesisConfig,
	mockCredentialConfig,
} from '../../../testUtils/mockConstants.test';
import { getEventBuffer } from '../../../../src/providers/personalize/utils';

jest.mock('../../../../src/utils');

describe('Personalize Provider Util: getEventBuffer', () => {
	const mockEventBuffer = EventBuffer as jest.Mock;

	afterEach(() => {
		mockEventBuffer.mockReset();
	});

	it("create a buffer if one doesn't exist", () => {
		const testBuffer = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
		});

		expect(mockEventBuffer).toBeCalledWith(
			mockBufferConfig,
			expect.any(Function)
		);
		expect(testBuffer).toBeInstanceOf(EventBuffer);
	});

	it('returns an existing buffer instance', () => {
		const testBuffer1 = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
		});
		const testBuffer2 = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
		});
		expect(testBuffer1).toBe(testBuffer2);
	});

	it('release other buffers & creates a new one if credential has changed', () => {
		const testBuffer1 = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
		});
		const testBuffer2 = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
			identityId: 'identityId2',
		});

		expect(testBuffer1.release).toHaveBeenCalledTimes(1);
		expect(testBuffer1).not.toBe(testBuffer2);
	});
});
