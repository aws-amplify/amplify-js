// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getEventBuffer } from '../../../../src/providers/kinesis-firehose/utils';
import { EventBuffer } from '../../../../src/utils';
import {
	mockBufferConfig,
	mockCredentialConfig,
	mockKinesisConfig,
} from '../../../testUtils/mockConstants';

jest.mock('../../../../src/utils');

describe('KinesisFirehose Provider Util: getEventBuffer', () => {
	const mockEventBuffer = EventBuffer as jest.Mock;

	afterEach(() => {
		mockEventBuffer.mockReset();
	});

	it("create a buffer if one doesn't exist", () => {
		const testBuffer = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
		});

		expect(mockEventBuffer).toHaveBeenCalledWith(
			mockBufferConfig,
			expect.any(Function),
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

	it('release other buffers & creates a new one if identity has changed', async () => {
		const testBuffer1 = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
		});
		jest.spyOn(testBuffer1, 'flushAll').mockReturnValue(Promise.resolve());
		jest.spyOn(testBuffer1, 'release');

		const testBuffer2 = getEventBuffer({
			...mockKinesisConfig,
			...mockCredentialConfig,
			identityId: 'identityId2',
		});

		await new Promise(process.nextTick);

		expect(testBuffer1.flushAll).toHaveBeenCalledTimes(1);
		expect(testBuffer1.release).toHaveBeenCalledTimes(1);
		expect(testBuffer1).not.toBe(testBuffer2);
	});
});
