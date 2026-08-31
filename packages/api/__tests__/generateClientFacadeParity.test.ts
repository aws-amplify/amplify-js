// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { enableFetchMocks } from 'jest-fetch-mock';
import { Amplify, createAmplifyContext } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { GraphQLAPI } from '@aws-amplify/api-graphql';
import { generateClient } from '@aws-amplify/api';

// Make global `Request` available.
enableFetchMocks();

const CTX_ENDPOINT = 'https://a-global-ctx-appsync-endpoint.local/graphql';
const CTX_API_KEY = 'GLOBAL-CTX-FAKE-KEY';

const _postSpy = jest.spyOn((GraphQLAPI as any)._api, 'post');

function getFirstPost() {
	expect(_postSpy).toHaveBeenCalledTimes(1);

	const postOptions = _postSpy.mock.calls[0][1] as {
		url: URL;
		options: { headers: Record<string, string> };
	};

	return {
		endpoint: postOptions.url.toString(),
		apiKey: postOptions.options.headers['X-Api-Key'],
	};
}

/**
 * Facade-parity regression: the `aws-amplify` facade's `configure()` installs a
 * global AmplifyContext via `setGlobalContext()` and NEVER configures the core
 * `Amplify` singleton. Older suites masked this by calling `Amplify.configure()`
 * directly (which does both). Here we set ONLY the global context — with real
 * config — and assert `generateClient()` still resolves the GraphQL config.
 */
describe('generateClient - facade-only configuration (global context, no core singleton)', () => {
	beforeEach(() => {
		setGlobalContext(
			createAmplifyContext({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: CTX_API_KEY,
						endpoint: CTX_ENDPOINT,
						region: 'north-pole-7',
					},
				},
			}),
		);

		// The mocked POST returns a plain (non-promise) object; `await` resolves
		// non-thenables as-is, so `mockReturnValue` is intentional.
		_postSpy.mockReturnValue({
			body: {
				json() {
					return JSON.stringify({
						data: { queryA: { a: 'a', b: 'b', c: 'c' } },
					});
				},
			},
		});
	});

	afterEach(() => {
		clearGlobalContext();
		jest.clearAllMocks();
	});

	afterAll(() => {
		_postSpy.mockRestore();
	});

	test('the core Amplify singleton is NOT configured in this scenario', () => {
		// Sanity guard for the regression: nothing configured the core singleton,
		// so any src path reading it would see empty config.
		expect(Amplify.getConfig().API).toBeUndefined();
	});

	test('generateClient() resolves GraphQL config from the global context', async () => {
		const client = generateClient();

		await client.graphql({ query: `query A { queryA { a b c } }` });

		const { endpoint, apiKey } = getFirstPost();
		expect(endpoint).toEqual(CTX_ENDPOINT);
		expect(apiKey).toEqual(CTX_API_KEY);
	});

	test('generateClient() honors reconfiguration of the global context per operation', async () => {
		// A client generated before reconfigure must pick up the NEW global
		// context on its next operation (lazy per-operation resolution), proving
		// the fallback is not a stale snapshot.
		const client = generateClient();

		const NEW_ENDPOINT = 'https://reconfigured-endpoint.local/graphql';
		const NEW_API_KEY = 'RECONFIGURED-KEY';
		setGlobalContext(
			createAmplifyContext({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: NEW_API_KEY,
						endpoint: NEW_ENDPOINT,
						region: 'north-pole-7',
					},
				},
			}),
		);

		await client.graphql({ query: `query A { queryA { a b c } }` });

		const { endpoint, apiKey } = getFirstPost();
		expect(endpoint).toEqual(NEW_ENDPOINT);
		expect(apiKey).toEqual(NEW_API_KEY);
	});
});
