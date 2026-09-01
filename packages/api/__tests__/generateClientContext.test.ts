// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { enableFetchMocks } from 'jest-fetch-mock';
import { Amplify } from '@aws-amplify/core';
import { GraphQLAPI } from '@aws-amplify/api-graphql';
import { generateClient } from '@aws-amplify/api';

// Make global `Request` available.
enableFetchMocks();

const GLOBAL_ENDPOINT = 'https://a-global-appsync-endpoint.local/graphql';
const GLOBAL_API_KEY = 'GLOBAL-FAKE-KEY';

const CTX_ENDPOINT = 'https://a-ctx-appsync-endpoint.local/graphql';
const CTX_API_KEY = 'CTX-FAKE-KEY';

const OPTIONS_ENDPOINT = 'https://an-options-appsync-endpoint.local/graphql';
const OPTIONS_API_KEY = 'OPTIONS-FAKE-KEY';

const _postSpy = jest.spyOn((GraphQLAPI as any)._api, 'post');

/**
 * Returns the endpoint + api key header used on the first (and only) recorded
 * GraphQL POST.
 */
function getFirstPost() {
	// Guard against silently indexing into an empty `mock.calls` array: assert a
	// single POST was recorded before reading `calls[0]`.
	expect(_postSpy).toHaveBeenCalledTimes(1);

	const postOptions = _postSpy.mock.calls[0][1] as {
		url: URL;
		options: {
			headers: Record<string, string>;
		};
	};

	return {
		endpoint: postOptions.url.toString(),
		apiKey: postOptions.options.headers['X-Api-Key'],
	};
}

/**
 * Configures the real global singleton with a GraphQL provider that is distinct
 * from any per-context configuration, so tests can prove which config path was
 * actually used.
 */
function configureGlobalSingleton() {
	Amplify.configure({
		API: {
			GraphQL: {
				defaultAuthMode: 'apiKey',
				apiKey: GLOBAL_API_KEY,
				endpoint: GLOBAL_ENDPOINT,
				region: 'north-pole-7',
			},
		},
	});
}

describe('generateClient - AmplifyContext overload', () => {
	beforeEach(() => {
		configureGlobalSingleton();
		// The mocked POST returns a plain (non-promise) object. Downstream code
		// `await`s the response, and `await` resolves non-thenable values as-is,
		// so `mockReturnValue` (rather than `mockResolvedValue`) is intentional.
		_postSpy.mockReturnValue({
			body: {
				json() {
					return JSON.stringify({
						data: {
							queryA: {
								a: 'a',
								b: 'b',
								c: 'c',
							},
						},
					});
				},
			},
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		// Restore the module-scope spy so it does not leak into other suites.
		_postSpy.mockRestore();
	});

	test('generateClient() binds to the global singleton path', async () => {
		const client = generateClient();

		await client.graphql({ query: `query A { queryA { a b c } }` });

		const { endpoint, apiKey } = getFirstPost();
		expect(endpoint).toEqual(GLOBAL_ENDPOINT);
		expect(apiKey).toEqual(GLOBAL_API_KEY);
	});

	test('generateClient(options) with a plain options object resolves config from the global singleton (not mistaken for a context)', async () => {
		// A plain options object is not a branded AmplifyContext, so the client
		// must fall back to the global singleton for config resolution and must
		// not throw or treat the options object as a context.
		const client = generateClient({ authMode: 'apiKey' });

		await client.graphql({ query: `query A { queryA { a b c } }` });

		const { endpoint, apiKey } = getFirstPost();
		expect(endpoint).toEqual(GLOBAL_ENDPOINT);
		expect(apiKey).toEqual(GLOBAL_API_KEY);
	});

	test('generateClient(ctx) resolves config from the provided context, not the global singleton', async () => {
		const ctx = createMockAmplifyContext({
			API: {
				GraphQL: {
					defaultAuthMode: 'apiKey',
					apiKey: CTX_API_KEY,
					endpoint: CTX_ENDPOINT,
					region: 'ctx-region-1',
				},
			},
		});

		const client = generateClient(ctx);

		await client.graphql({ query: `query A { queryA { a b c } }` });

		const { endpoint, apiKey } = getFirstPost();
		// Uses the context config ...
		expect(endpoint).toEqual(CTX_ENDPOINT);
		expect(apiKey).toEqual(CTX_API_KEY);
		// ... and specifically NOT the global singleton config.
		expect(endpoint).not.toEqual(GLOBAL_ENDPOINT);
		expect(apiKey).not.toEqual(GLOBAL_API_KEY);
	});

	test('generateClient(ctx, options) forwards options on top of the context', async () => {
		const ctx = createMockAmplifyContext({
			API: {
				GraphQL: {
					defaultAuthMode: 'apiKey',
					apiKey: CTX_API_KEY,
					endpoint: CTX_ENDPOINT,
					region: 'ctx-region-1',
				},
			},
		});

		// A client-level `endpoint`/`authMode`/`apiKey` override must take
		// precedence over both the context config and the global singleton.
		const client = generateClient(ctx, {
			endpoint: OPTIONS_ENDPOINT,
			authMode: 'apiKey',
			apiKey: OPTIONS_API_KEY,
		});

		await client.graphql({ query: `query A { queryA { a b c } }` });

		const { endpoint, apiKey } = getFirstPost();
		expect(endpoint).toEqual(OPTIONS_ENDPOINT);
		expect(apiKey).toEqual(OPTIONS_API_KEY);
		expect(endpoint).not.toEqual(CTX_ENDPOINT);
		expect(endpoint).not.toEqual(GLOBAL_ENDPOINT);
	});
});
