// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@smithy/md5-js';

import { calculateContentMd5 } from '../../../src/foundation/utils/md5';
import { FoundationContext } from '../../../src/foundation/types';

jest.mock('@smithy/md5-js');

const mockMd5 = Md5 as jest.Mock;

const createTestCtx = (
	overrides: Partial<FoundationContext> = {},
): FoundationContext => ({
	amplify: {} as FoundationContext['amplify'],
	readFile: jest.fn(),
	toBase64: jest.fn().mockReturnValue('MOCK_BASE64'),
	...overrides,
});

describe('calculateContentMd5 (foundation)', () => {
	const stringContent = 'string-content';
	const fileReaderResult = new ArrayBuffer(8);
	const md5Digest = new Uint8Array([1, 2, 3, 4]);

	beforeEach(() => {
		mockMd5.mockClear();
	});

	it.each([
		{ type: 'string', content: stringContent },
		{ type: 'ArrayBuffer view', content: new Uint8Array() },
		{ type: 'ArrayBuffer', content: new ArrayBuffer(8) },
	])(
		'passes content directly to hasher.update for content type: $type (no ctx.readFile call)',
		async ({ content }) => {
			const ctx = createTestCtx();

			await calculateContentMd5(ctx, content);

			const [mockMd5Instance] = mockMd5.mock.instances;
			expect(mockMd5Instance.update).toHaveBeenCalledWith(content);
			expect(ctx.readFile).not.toHaveBeenCalled();
			expect(ctx.toBase64).toHaveBeenCalled();
		},
	);

	it('reads Blob content via ctx.readFile and feeds the ArrayBuffer to the hasher', async () => {
		const ctx = createTestCtx({
			readFile: jest.fn().mockResolvedValue(fileReaderResult),
		});
		const blob = new Blob([stringContent]);

		await calculateContentMd5(ctx, blob);

		const [mockMd5Instance] = mockMd5.mock.instances;
		expect(ctx.readFile).toHaveBeenCalledWith(blob);
		expect(mockMd5Instance.update).toHaveBeenCalledWith(fileReaderResult);
		expect(ctx.toBase64).toHaveBeenCalled();
	});

	it('returns the base64 string produced by ctx.toBase64 over the Md5 digest', async () => {
		const ctx = createTestCtx();
		mockMd5.mockImplementationOnce(() => ({
			update: jest.fn(),
			digest: jest.fn().mockResolvedValue(md5Digest),
		}));

		const result = await calculateContentMd5(ctx, stringContent);

		expect(ctx.toBase64).toHaveBeenCalledWith(md5Digest);
		expect(result).toBe('MOCK_BASE64');
	});

	it('propagates errors thrown by ctx.readFile', async () => {
		const ctx = createTestCtx({
			readFile: jest.fn().mockRejectedValue(new Error('read failed')),
		});

		await expect(
			calculateContentMd5(ctx, new Blob([stringContent])),
		).rejects.toThrow('read failed');
		expect(ctx.toBase64).not.toHaveBeenCalled();
	});
});
