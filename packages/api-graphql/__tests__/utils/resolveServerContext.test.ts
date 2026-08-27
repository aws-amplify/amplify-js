// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyClassV6,
	isAmplifyContext,
} from '@aws-amplify/core';

import { resolveServerContext } from '../../src/utils/resolveServerContext';

import { createMockAmplifyContext } from '../testUtils/mockAmplifyContext';

// The legacy server-context registry (getAmplifyServerContext) was removed in
// Phase C1. `isAmplifyContext` / branding come from the real core module and the
// bridge runs for real.
describe('resolveServerContext', () => {
	it('returns an already-branded AmplifyContext unchanged (same reference)', () => {
		const ctx = createMockAmplifyContext();

		const result = resolveServerContext(ctx);

		expect(result).toBe(ctx);
		expect(isAmplifyContext(result)).toBe(true);
	});

	it('bridges a bare AmplifyClass instance and brands the result', async () => {
		const auth = {
			fetchAuthSession: jest.fn().mockResolvedValue({}),
			clearCredentials: jest.fn().mockResolvedValue(undefined),
			getTokens: jest.fn().mockResolvedValue(undefined),
		};
		const mockAmplify = {
			getConfig: jest.fn().mockReturnValue({ API: { GraphQL: {} } }),
			libraryOptions: {},
			Auth: auth,
		} as unknown as AmplifyClassV6;

		const result = resolveServerContext(mockAmplify);

		expect(isAmplifyContext(result)).toBe(true);
		expect(AMPLIFY_CONTEXT_BRAND in result).toBe(true);

		// The bridged context delegates through the underlying AmplifyClass.Auth.
		await result.fetchAuthSession();
		expect(auth.fetchAuthSession).toHaveBeenCalledWith({});
	});
});
