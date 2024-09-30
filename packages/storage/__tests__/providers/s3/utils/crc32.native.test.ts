// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { calculateContentCRC32 } from '../../../../src/providers/s3/utils/crc32.native';

const MB = 1024 * 1024;
const getBlob = (size: number) => new Blob(['1'.repeat(size)]);

describe('calculate crc32 native', () => {
	it('should return undefined', async () => {
		expect(await calculateContentCRC32(getBlob(8 * MB))).toEqual(undefined);
	});
});
