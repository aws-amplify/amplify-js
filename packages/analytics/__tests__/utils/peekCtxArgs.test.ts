// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { peekCtxArgs } from '../../src/utils';
import { createMockAmplifyContext } from '../testUtils/mockAmplifyContext';

interface TestInput {
	name: string;
}

describe('peekCtxArgs', () => {
	const mockCtx = createMockAmplifyContext();
	const mockInput: TestInput = { name: 'my-event' };

	it('returns the explicit context and input on a ctx-first call', () => {
		const { ctx, input } = peekCtxArgs<TestInput>([mockCtx, mockInput]);

		expect(ctx).toBe(mockCtx);
		expect(input).toBe(mockInput);
	});

	it('returns undefined ctx and the input on an input-only call', () => {
		const { ctx, input } = peekCtxArgs<TestInput>([mockInput]);

		expect(ctx).toBeUndefined();
		expect(input).toBe(mockInput);
	});

	it('returns undefined ctx and input on an empty args array', () => {
		const { ctx, input } = peekCtxArgs<TestInput | undefined>([]);

		expect(ctx).toBeUndefined();
		expect(input).toBeUndefined();
	});

	it('does not consume or mutate the args array', () => {
		const args = [mockCtx, mockInput];

		peekCtxArgs<TestInput>(args);

		expect(args).toEqual([mockCtx, mockInput]);
	});

	it('does not treat an unbranded ctx-shaped object as a context', () => {
		// An object structurally similar to a context but lacking the brand must
		// be treated as the input (mirrors isAmplifyContext's brand-presence check).
		const unbranded = {
			resourcesConfig: {},
			libraryOptions: {},
		};
		const { ctx, input } = peekCtxArgs<typeof unbranded>([unbranded]);

		expect(ctx).toBeUndefined();
		expect(input).toBe(unbranded);
	});
});
