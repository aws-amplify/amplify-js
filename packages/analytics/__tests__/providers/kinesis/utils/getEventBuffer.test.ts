// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getEventBuffer } from '../../../../src/providers/kinesis/utils/getEventBuffer';
import { EventBuffer } from '../../../../src/utils/eventBuffer';

jest.mock('../../../../src/utils/eventBuffer');

describe('Kinesis Provider Util: getEventBuffer', () => {
	const mockBufferConfig = {
		bufferSize: 10,
		flushSize: 5,
		flushInterval: 50,
	};

	const mockConfig = {
		...mockBufferConfig,
		region: 'us-east-1',
	};

	const mockCredentialConfig = {
		credentials: {
			accessKeyId: 'accessKeyId0',
			secretAccessKey: 'secretAccessKey0',
			sessionToken: 'sessionToken0',
		},
		identityId: 'identity0',
	};

	const mockEventBuffer = EventBuffer as jest.Mock;

	afterEach(() => {
		mockEventBuffer.mockReset();
	});

	it("create a buffer if one doesn't exist", () => {
		const testBuffer = getEventBuffer({
			...mockConfig,
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
			...mockConfig,
			...mockCredentialConfig,
		});
		const testBuffer2 = getEventBuffer({
			...mockConfig,
			...mockCredentialConfig,
		});
		expect(testBuffer1).toBe(testBuffer2);
	});

	it('release other buffers & creates a new one if credential has changed', () => {
		const testBuffer1 = getEventBuffer({
			...mockConfig,
			...mockCredentialConfig,
		});
		const testBuffer2 = getEventBuffer({
			...mockConfig,
			...mockCredentialConfig,
			identityId: 'identityId2',
		});

		expect(testBuffer1.release).toHaveBeenCalledTimes(1);
		expect(testBuffer1).not.toBe(testBuffer2);
	});
});
