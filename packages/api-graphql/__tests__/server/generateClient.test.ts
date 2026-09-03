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
});
