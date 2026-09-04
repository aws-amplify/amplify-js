// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { ResourcesConfig } from '@aws-amplify/core';
import { InvalidAmplifyContextError } from '@aws-amplify/core/internals/utils';

import { generateClient } from '../../src/server';
import { getInternals } from '../../src/types';
import { mockApiResponse } from '../utils';

const config: ResourcesConfig = {
	API: {
		GraphQL: {
			apiKey: 'apikey',
			customEndpoint: undefined,
			customEndpointRegion: undefined,
			defaultAuthMode: 'apiKey',
			endpoint: 'https://0.0.0.0/graphql',
			region: 'us-east-1',
		},
	},
};

/**
 * Behavioral assertions for the server (req/res) `generateClient` entry.
 *
 * Ported from the pre-collapse wrapper contract (Phase C4): the entry no
 * longer wraps `client.graphql` — the shared `graphql` accepts the
 * per-request branded `AmplifyContext` natively as its first argument.
 */
describe('server generateClient (req/res entry)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('threads the per-request AmplifyContext through to the request layer', async () => {
		const spy = mockApiResponse({ data: { someQuery: { a: 1 } } });
		const ctx = createMockAmplifyContext(config);

		const client = generateClient({ config });

		await client.graphql(ctx, {
			query: `query Q { someQuery { a } }`,
		});

		// The exact ctx object supplied per-request must be the amplify
		// instance the transport receives (no re-binding, no bridging).
		expect(spy).toHaveBeenCalledTimes(1);
		const [amplifyArg, postOptions] = spy.mock.calls[0] as [
			unknown,
			{ url: URL; options: { headers: Record<string, string> } },
		];
		expect(amplifyArg).toBe(ctx);
		expect(postOptions.url.toString()).toEqual('https://0.0.0.0/graphql');
		expect(postOptions.options.headers['X-Api-Key']).toEqual('apikey');
	});

	test('rejects a graphql() call missing the per-request context', () => {
		const client = generateClient({ config });

		expect(() =>
			// @ts-expect-error omitting the required contextSpec for test
			client.graphql({ query: `query Q { someQuery { a } }` }),
		).toThrow(InvalidAmplifyContextError);
	});

	test('constructs the client with `amplify: null` internals (req/res server contract)', () => {
		const client = generateClient({ config });

		// `@aws-amplify/data-schema` keys its op generation on this:
		// `useContext = params.amplify === null` makes every generated op
		// require (and duck-check) the per-request contextSpec argument.
		expect(
			getInternals(client as unknown as Parameters<typeof getInternals>[0])
				.amplify,
		).toBeNull();
	});

	/**
	 * REGRESSION GUARD (PR #14931 finding 4): the pre-Phase-C server entry
	 * wrapped `client.graphql` and invoked the shared implementation via
	 * `prevGraphql.call({ [__amplify]: amplifyInstance }, ...)` — a rebound
	 * `this` carrying ONLY the context. `getInternals(this)` therefore read
	 * `authMode`/`authToken`/`headers` off an object that lacked them, and
	 * every client-instance-level option was silently dropped: requests fell
	 * back to the config default (`apiKey` here → `X-Api-Key`, no
	 * `Authorization`, no custom headers, no signing for `lambda`).
	 *
	 * The collapsed entry passes the real client as `this` (ctx arrives as
	 * the explicit first argument instead), so client-level options are
	 * honored. These tests assert at the transport boundary; if anyone
	 * reintroduces a wrapper that rebinds `this` without the client
	 * internals, the `Authorization`/custom-header/signing assertions below
	 * fail (the request would instead carry the config-default `X-Api-Key`).
	 */
	describe('client-instance-level options (authMode/authToken/headers)', () => {
		test('applies client-level authMode, authToken, and headers to the outgoing request', async () => {
			const spy = mockApiResponse({ data: { someQuery: { a: 1 } } });
			const ctx = createMockAmplifyContext(config);

			const client = generateClient({
				config,
				authMode: 'lambda',
				authToken: 'client-lambda-token',
				headers: { 'x-client-header': 'client-value' },
			});

			await client.graphql(ctx, {
				query: `query Q { someQuery { a } }`,
			});

			expect(spy).toHaveBeenCalledTimes(1);
			const [, postOptions] = spy.mock.calls[0] as [
				unknown,
				{
					url: URL;
					options: {
						headers: Record<string, string>;
						signingServiceInfo?: { service: string; region: string };
					};
				},
			];

			// Client-level `authToken` becomes the Authorization header
			// (also satisfies the `lambda` auth mode's token requirement).
			expect(postOptions.options.headers.Authorization).toEqual(
				'client-lambda-token',
			);
			// Client-level custom headers are forwarded.
			expect(postOptions.options.headers['x-client-header']).toEqual(
				'client-value',
			);
			// Client-level `authMode: 'lambda'` won over the config default
			// (`apiKey`): no API key header, and the request is signed.
			expect(postOptions.options.headers['X-Api-Key']).toBeUndefined();
			expect(postOptions.options.signingServiceInfo).toEqual({
				service: 'appsync',
				region: 'us-east-1',
			});
		});

		test('call-level authMode, authToken, and headers take precedence over client-level', async () => {
			const spy = mockApiResponse({ data: { someQuery: { a: 1 } } });
			const ctx = createMockAmplifyContext(config);

			const client = generateClient({
				config,
				authMode: 'lambda',
				authToken: 'client-lambda-token',
				headers: { 'x-client-header': 'client-value' },
			});

			await client.graphql(
				ctx,
				{
					query: `query Q { someQuery { a } }`,
					authMode: 'apiKey',
					authToken: 'call-token',
				},
				{ 'x-call-header': 'call-value' },
			);

			expect(spy).toHaveBeenCalledTimes(1);
			const [, postOptions] = spy.mock.calls[0] as [
				unknown,
				{
					url: URL;
					options: {
						headers: Record<string, string>;
						signingServiceInfo?: { service: string; region: string };
					};
				},
			];

			// Call-level `authMode: 'apiKey'` wins over client-level `lambda`:
			// the API key header is attached and the request is unsigned.
			expect(postOptions.options.headers['X-Api-Key']).toEqual('apikey');
			expect(postOptions.options.signingServiceInfo).toBeUndefined();
			// Call-level `authToken` wins over the client-level token.
			expect(postOptions.options.headers.Authorization).toEqual('call-token');
			// Call-level headers replace client-level headers entirely.
			expect(postOptions.options.headers['x-call-header']).toEqual(
				'call-value',
			);
			expect(postOptions.options.headers['x-client-header']).toBeUndefined();
		});

		test('config-level defaults apply when neither client- nor call-level options are set', async () => {
			// Control case (same contract the ctx-threading test above pins):
			// with no client- or call-level auth options, the config default
			// `apiKey` mode applies.
			const spy = mockApiResponse({ data: { someQuery: { a: 1 } } });
			const ctx = createMockAmplifyContext(config);

			const client = generateClient({ config });

			await client.graphql(ctx, {
				query: `query Q { someQuery { a } }`,
			});

			expect(spy).toHaveBeenCalledTimes(1);
			const [, postOptions] = spy.mock.calls[0] as [
				unknown,
				{
					url: URL;
					options: {
						headers: Record<string, string>;
						signingServiceInfo?: { service: string; region: string };
					};
				},
			];
			expect(postOptions.options.headers['X-Api-Key']).toEqual('apikey');
			expect(postOptions.options.headers.Authorization).toBeUndefined();
			expect(postOptions.options.signingServiceInfo).toBeUndefined();
		});
	});
});
