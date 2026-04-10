// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createServerRunner } from '../../src/adapter-core/createServerRunner';

jest.mock('aws-jwt-verify', () => ({
	CognitoJwtVerifier: {
		create: jest.fn(() => ({
			verify: jest.fn().mockResolvedValue({}),
		})),
	},
}));

// Polyfill structuredClone for test environment
if (!globalThis.structuredClone) {
	globalThis.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

const mockCookieAdapter = {
	get: jest.fn(),
	getAll: jest.fn().mockReturnValue([]),
	set: jest.fn(),
	delete: jest.fn(),
};

const baseConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test',
			userPoolClientId: 'testclient',
		},
	},
};

describe('createServerRunner', () => {
	it('returns runWithAmplifyServerContext and resourcesConfig', () => {
		const result = createServerRunner({
			config: baseConfig,
			createCookieStorageAdapter: () => mockCookieAdapter,
		});

		expect(typeof result.runWithAmplifyServerContext).toBe('function');
		expect(result.resourcesConfig).toBeDefined();
		expect(result.resourcesConfig.Auth).toBeDefined();
	});

	it('runs operation with AmplifyContext when Auth is configured', async () => {
		const { runWithAmplifyServerContext } = createServerRunner({
			config: baseConfig,
			createCookieStorageAdapter: () => mockCookieAdapter,
		});

		const result = await runWithAmplifyServerContext({
			serverContext: {},
			operation: ctx => {
				expect(ctx.resourcesConfig).toBeDefined();
				expect(typeof ctx.fetchAuthSession).toBe('function');

				return 'ok';
			},
		});

		expect(result).toBe('ok');
	});

	it('runs operation without Auth when Auth is not configured', async () => {
		const { runWithAmplifyServerContext } = createServerRunner({
			config: { Storage: { S3: { bucket: 'b', region: 'us-east-1' } } },
			createCookieStorageAdapter: () => mockCookieAdapter,
		});

		const result = await runWithAmplifyServerContext({
			serverContext: {},
			operation: ctx => {
				expect(ctx.resourcesConfig).toBeDefined();

				return 'no-auth';
			},
		});

		expect(result).toBe('no-auth');
	});

	it('uses sharedInMemoryStorage when serverContext is null', async () => {
		const { runWithAmplifyServerContext } = createServerRunner({
			config: baseConfig,
			createCookieStorageAdapter: () => mockCookieAdapter,
		});

		const result = await runWithAmplifyServerContext({
			serverContext: null,
			operation: () => 'null-ctx',
		});

		expect(result).toBe('null-ctx');
	});

	it('passes runtimeOptions to globalSettings', () => {
		const { globalSettings } = createServerRunner({
			config: baseConfig,
			runtimeOptions: { cookies: { sameSite: 'strict' } },
			createCookieStorageAdapter: () => mockCookieAdapter,
		});

		expect(globalSettings.getRuntimeOptions()).toEqual({
			cookies: { sameSite: 'strict' },
		});
	});
});
