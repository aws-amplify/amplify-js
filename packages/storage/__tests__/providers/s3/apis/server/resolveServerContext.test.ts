// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { resolveServerContext } from '../../../../../src/providers/s3/apis/server/resolveServerContext';

jest.mock('@aws-amplify/core/internals/adapter-core');

const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);

// Runtime brand used to identify AmplifyContext objects. Kept in sync with
// core's `AMPLIFY_CONTEXT_BRAND` (Symbol.for('amplify.context')).
const AMPLIFY_CONTEXT_BRAND = Symbol.for('amplify.context');

describe('resolveServerContext', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('legacy server ContextSpec branch', () => {
		const mockResourcesConfig = { Storage: { S3: { bucket: 'b' } } } as any;
		const mockSession = { identityId: 'id-123' } as any;
		const mockTokens = { accessToken: 'token' } as any;
		// Mimics `AmplifyClass`: it exposes resourcesConfig/libraryOptions via
		// getConfig()/libraryOptions and a cross-category `Auth` utility, but
		// CRUCIALLY does NOT define top-level
		// fetchAuthSession/clearCredentials/getTokens methods.
		let mockAmplifyClass: any;
		const mockContextSpec = { token: { value: Symbol('123') } } as any;

		beforeEach(() => {
			mockAmplifyClass = {
				getConfig: jest.fn(() => mockResourcesConfig),
				libraryOptions: {},
				Auth: {
					fetchAuthSession: jest.fn().mockResolvedValue(mockSession),
					clearCredentials: jest.fn().mockResolvedValue(undefined),
					getTokens: jest.fn().mockResolvedValue(mockTokens),
				},
			};
			mockGetAmplifyServerContext.mockReturnValue({
				amplify: mockAmplifyClass,
			} as any);
		});

		it('should unwrap the AmplifyClass from the server context', () => {
			resolveServerContext(mockContextSpec);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(mockContextSpec);
		});

		it('should source resourcesConfig from amplify.getConfig()', () => {
			const resolved = resolveServerContext(mockContextSpec);
			expect(mockAmplifyClass.getConfig).toHaveBeenCalledTimes(1);
			expect(resolved.resourcesConfig).toBe(mockResourcesConfig);
		});

		it('should source libraryOptions from amplify.libraryOptions', () => {
			const resolved = resolveServerContext(mockContextSpec);
			expect(resolved.libraryOptions).toBe(mockAmplifyClass.libraryOptions);
		});

		it('should delegate fetchAuthSession to amplify.Auth.fetchAuthSession', async () => {
			const resolved = resolveServerContext(mockContextSpec);
			const options = { forceRefresh: true };
			const result = await resolved.fetchAuthSession(options);

			expect(mockAmplifyClass.Auth.fetchAuthSession).toHaveBeenCalledWith(
				options,
			);
			expect(result).toBe(mockSession);
		});

		it('should delegate fetchAuthSession with default options when none provided', async () => {
			const resolved = resolveServerContext(mockContextSpec);
			await resolved.fetchAuthSession();

			expect(mockAmplifyClass.Auth.fetchAuthSession).toHaveBeenCalledWith({});
		});

		it('should delegate clearCredentials to amplify.Auth.clearCredentials', async () => {
			const resolved = resolveServerContext(mockContextSpec);
			await resolved.clearCredentials();

			expect(mockAmplifyClass.Auth.clearCredentials).toHaveBeenCalledTimes(1);
		});

		it('should delegate getTokens to amplify.Auth.getTokens', async () => {
			const resolved = resolveServerContext(mockContextSpec);
			const options = { forceRefresh: true };
			const result = await resolved.getTokens(options);

			expect(mockAmplifyClass.Auth.getTokens).toHaveBeenCalledWith(options);
			expect(result).toBe(mockTokens);
		});
	});

	describe('branded AmplifyContext branch', () => {
		it('should return an already-branded AmplifyContext unchanged', () => {
			const brandedContext = {
				resourcesConfig: {},
				libraryOptions: {},
				fetchAuthSession: jest.fn(),
				clearCredentials: jest.fn(),
				getTokens: jest.fn(),
			} as unknown as AmplifyContext;
			Object.defineProperty(brandedContext, AMPLIFY_CONTEXT_BRAND, {
				value: true,
				enumerable: false,
			});

			const resolved = resolveServerContext(brandedContext);

			expect(resolved).toBe(brandedContext);
			// The server context must NOT be consulted for a real AmplifyContext.
			expect(mockGetAmplifyServerContext).not.toHaveBeenCalled();
		});
	});
});
