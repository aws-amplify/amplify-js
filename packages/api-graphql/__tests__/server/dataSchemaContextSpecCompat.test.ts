// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test mirroring the gen2 Next.js data e2e samples
 * (next-use-cases-14/15, next-use-cases-server-auth-14,
 * next_api_data_client_gen2).
 *
 * The RELEASED `@aws-amplify/data-schema` types server-operation params as its
 * own `ContextSpec { token: { value: symbol } }` and runtime-duck-checks them
 * via `typeof arg?.token?.value === 'symbol'`
 * (dist/cjs/runtime/internals/operations/custom.js), then forwards the object
 * positionally to `client.graphql(contextSpec, options)`. This suite drives a
 * faithful replica of that generated op through the REAL chain:
 *
 *   fake data-schema op → client.graphql(ctx, options) → GraphQLAPI →
 *   InternalGraphQLAPI._graphql → @aws-amplify/api-rest internals post →
 *   transferHandler → SigV4 signing → fetch
 *
 * Only the true boundaries are mocked: the context's `fetchAuthSession`
 * (credential source) and global `fetch` (HTTP).
 */
import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { generateClient } from '../../src/server';
import { GraphQLResult } from '../../src/types';

const ENDPOINT = 'https://fake-appsync-endpoint.local/graphql';

const config = {
	API: {
		GraphQL: {
			defaultAuthMode: 'iam' as const,
			endpoint: ENDPOINT,
			region: 'us-west-2',
		},
	},
};

const credentials = {
	accessKeyId: 'FAKE-ACCESS-KEY-ID',
	secretAccessKey: 'fake-secret-access-key',
	sessionToken: 'fake-session-token',
};

/**
 * Replica of the released data-schema runtime's `argIsContextSpec`
 * (dist/cjs/runtime/internals/operations/custom.js#13-15).
 */
const argIsContextSpec = (
	arg: unknown,
): arg is { token: { value: symbol } } => {
	return (
		typeof (arg as { token?: { value?: unknown } } | undefined)?.token
			?.value === 'symbol'
	);
};

/**
 * Minimal structural view of the server client covering only what the fake
 * op calls. Typing the param as `ReturnType<typeof generateClient>` blows
 * TypeScript's type-instantiation depth (TS2321) on the full generic
 * `V6ClientSSRRequest`; the op only needs the two-arg `graphql` shape.
 */
interface MinimalServerClient {
	graphql(ctx: AmplifyContext, options: { query: string }): unknown;
}

/**
 * Replica of a generated data-schema server op: duck-checks the positional
 * contextSpec exactly like the released runtime, then forwards it two-arg to
 * `client.graphql(contextSpec, options)`.
 */
const fakeDataSchemaOp = async (
	client: MinimalServerClient,
	contextSpec: unknown,
	options: { query: string },
) => {
	// Captured before the guard narrows `contextSpec`, mirroring how the
	// released runtime forwards the SAME positional object it duck-checked.
	const forwardedContext = contextSpec as AmplifyContext;

	if (!argIsContextSpec(contextSpec)) {
		throw new Error(
			'Invalid first argument passed to op. Expected contextSpec',
		);
	}

	return client.graphql(forwardedContext, options) as Promise<GraphQLResult>;
};

interface FetchArgs {
	url: string;
	init: { method: string; headers: Record<string, string>; body?: string };
}

describe('data-schema ContextSpec compatibility (integration)', () => {
	const mockFetch = jest.fn();
	let originalFetch: unknown;

	beforeAll(() => {
		originalFetch = (globalThis as { fetch?: unknown }).fetch;
		(globalThis as { fetch?: unknown }).fetch = mockFetch;
	});

	afterAll(() => {
		(globalThis as { fetch?: unknown }).fetch = originalFetch;
	});

	beforeEach(() => {
		jest.clearAllMocks();
		// Minimal Response-like object satisfying core's fetchTransferHandler.
		mockFetch.mockResolvedValue({
			status: 200,
			headers: {
				forEach(_cb: (value: string, key: string) => void) {
					// no headers to enumerate
				},
			},
			body: null,
			text: async () => JSON.stringify({ data: { someQuery: { a: 1 } } }),
			blob: async () => new Blob([]),
			json: async () => ({ data: { someQuery: { a: 1 } } }),
		});
	});

	const getFetchArgs = (): FetchArgs => {
		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, init] = mockFetch.mock.calls[0] as [
			string,
			FetchArgs['init'],
		];

		return { url: url.toString(), init };
	};

	it('a branded context passes BOTH the data-schema duck-check and isAmplifyContext', () => {
		const ctx = createMockAmplifyContext(config);

		expect(argIsContextSpec(ctx)).toBe(true);
		expect(isAmplifyContext(ctx)).toBe(true);
	});

	it('the fake op accepts the branded context and graphql signs via THAT context fetchAuthSession', async () => {
		const mockFetchAuthSession = jest.fn().mockResolvedValue({ credentials });
		const ctx = createMockAmplifyContext(config, {
			fetchAuthSession: mockFetchAuthSession,
		});

		const client = generateClient({ config });

		const result = await fakeDataSchemaOp(client, ctx, {
			query: `query Q { someQuery { a } }`,
		});

		// The credentials used for signing were resolved from the exact context
		// object the op forwarded — request-scoped auth, no global fallback.
		expect(mockFetchAuthSession).toHaveBeenCalled();

		// The real transport signed the request (IAM/SigV4) and hit the endpoint.
		const { url, init } = getFetchArgs();
		expect(url).toEqual(ENDPOINT);
		expect(init.method).toEqual('POST');

		const headerEntries = Object.fromEntries(
			Object.entries(init.headers).map(([key, value]) => [
				key.toLowerCase(),
				value,
			]),
		);
		expect(headerEntries.authorization).toContain('AWS4-HMAC-SHA256');
		expect(headerEntries.authorization).toContain(credentials.accessKeyId);
		expect(headerEntries['x-amz-security-token']).toEqual(
			credentials.sessionToken,
		);

		expect(result.data).toEqual({ someQuery: { a: 1 } });
	});

	it('rejects an unbranded, token-less object exactly like the released runtime would', async () => {
		const client = generateClient({ config });

		await expect(
			fakeDataSchemaOp(
				client,
				{ resourcesConfig: config },
				{ query: `query Q { someQuery { a } }` },
			),
		).rejects.toThrow('Expected contextSpec');
	});
});
