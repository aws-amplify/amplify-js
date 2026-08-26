// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_CONTEXT_BRAND, isAmplifyContext } from '@aws-amplify/core';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { resolveServerContext } from '../../src/utils/resolveServerContext';

import { createMockAmplifyContext } from '../testUtils/mockAmplifyContext';

// Mock only the adapter-core boundary (same pattern as the api-rest server
// tests). `isAmplifyContext` / branding come from the real core module and the
// bridge runs for real.
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockGetAmplifyServerContext = getAmplifyServerContext as jest.Mock;

describe('resolveServerContext', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns an already-branded AmplifyContext unchanged (same reference)', () => {
		const ctx = createMockAmplifyContext();

		const result = resolveServerContext(ctx);

		expect(result).toBe(ctx);
		expect(isAmplifyContext(result)).toBe(true);
		// Brand-check branch short-circuits before touching adapter-core.
		expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
	});

	it('resolves a legacy ContextSpec via getAmplifyServerContext and brands the result', async () => {
		const auth = {
			fetchAuthSession: jest.fn().mockResolvedValue({}),
			clearCredentials: jest.fn().mockResolvedValue(undefined),
			getTokens: jest.fn().mockResolvedValue(undefined),
		};
		const mockAmplify = {
			getConfig: jest.fn().mockReturnValue({ API: { GraphQL: {} } }),
			libraryOptions: {},
			Auth: auth,
		};
		mockGetAmplifyServerContext.mockReturnValue({ amplify: mockAmplify });

		const contextSpec = {
			token: { value: Symbol('test') },
		} as unknown as AmplifyServer.ContextSpec;

		const result = resolveServerContext(contextSpec);

		expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(contextSpec);
		expect(isAmplifyContext(result)).toBe(true);
		expect(AMPLIFY_CONTEXT_BRAND in result).toBe(true);

		// The bridged context delegates through the underlying AmplifyClass.Auth.
		await result.fetchAuthSession();
		expect(auth.fetchAuthSession).toHaveBeenCalledWith({});
	});
});
