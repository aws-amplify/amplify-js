import { ResourcesConfig } from 'aws-amplify';
import { parseAmplifyConfig } from 'aws-amplify/utils';
import { isAmplifyContext } from 'aws-amplify/adapter-core/internals';
import type { AmplifyContext } from 'aws-amplify/adapter-core/internals';
import { getInternals } from '@aws-amplify/api-graphql';

import {
	generateServerClientUsingCookies,
	generateServerClientUsingReqRes,
} from '../../src/api';
import { createRunWithAmplifyServerContext } from '../../src/utils';
import { NextApiRequestMock, NextApiResponseMock } from '../mocks/headers';
import { createServerRunnerForAPI } from '../../src/api/createServerRunnerForAPI';

const headers = import('next/headers.js');
(global as any).Headers = jest.requireActual('node-fetch').Headers;

const mockAmplifyConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			identityPoolId: '123',
			userPoolId: 'abc',
			userPoolClientId: 'def',
		},
	},
	API: {
		GraphQL: {
			defaultAuthMode: 'apiKey',
			apiKey: 'FAKE-KEY',
			endpoint: 'https://localhost/graphql',
			region: 'local-host-h4x',
		},
	},
};

jest.mock('../../src/utils', () => ({
	createRunWithAmplifyServerContext: jest.fn(() => jest.fn()),
	createCookieStorageAdapterFromNextServerContext: jest.fn(),
}));
jest.mock('aws-amplify/utils', () => ({
	...jest.requireActual('aws-amplify/utils'),
	parseAmplifyConfig: jest.fn(() => mockAmplifyConfig),
}));

jest.mock('aws-amplify/adapter-core');

const mockParseAmplifyConfig = parseAmplifyConfig as jest.Mock;
const mockCreateRunWithAmplifyServerContext =
	createRunWithAmplifyServerContext as jest.Mock;

describe('generateServerClientUsingCookies', () => {
	it('should throw error when used with req/res', async () => {
		const mockedReq = new NextApiRequestMock();
		const mockedRes = NextApiResponseMock;

		expect(() => {
			// as any here to avoid type error from passing invalid input.
			// this tests runtime exception
			(generateServerClientUsingCookies as any)({
				request: mockedReq,
				response: mockedRes,
			});
		}).toThrow();
	});

	it('should call createRunWithAmplifyServerContext to create runWithAmplifyServerContext function', async () => {
		const { cookies } = await headers;

		generateServerClientUsingCookies({ config: mockAmplifyConfig, cookies });
		expect(mockCreateRunWithAmplifyServerContext).toHaveBeenCalledWith({
			config: mockAmplifyConfig,
		});
	});

	it('stores a BRANDED AmplifyContext (not a function) as the client internals amplify instance', async () => {
		const { cookies } = await headers;

		const client = generateServerClientUsingCookies({
			config: mockAmplifyConfig,
			cookies,
		});
		const { amplify } = getInternals(
			client as Parameters<typeof getInternals>[0],
		);

		// Main stored a closure here; the context migration stores a branded,
		// client-bound context instead.
		expect(typeof amplify).not.toBe('function');
		expect(isAmplifyContext(amplify)).toBe(true);
		expect(Object.isFrozen(amplify)).toBe(true);

		// The structural duck-check the released @aws-amplify/data-schema
		// performs (`typeof arg?.token?.value === 'symbol'`).
		const ctx = amplify as unknown as AmplifyContext;
		expect(typeof ctx.token.value).toBe('symbol');
		expect(Object.isFrozen(ctx.token)).toBe(true);
	});

	it('delegates auth operations per call through runWithAmplifyServerContext with the client cookies', async () => {
		const { cookies } = await headers;

		const innerFetchAuthSession = jest.fn().mockResolvedValue({});
		const mockRunWithAmplifyServerContext = jest.fn(
			async ({
				operation,
			}: {
				operation(contextSpec: unknown): Promise<unknown>;
			}) => operation({ fetchAuthSession: innerFetchAuthSession }),
		);
		mockCreateRunWithAmplifyServerContext.mockReturnValueOnce(
			mockRunWithAmplifyServerContext,
		);

		const client = generateServerClientUsingCookies({
			config: mockAmplifyConfig,
			cookies,
		});
		const ctx = getInternals(client as Parameters<typeof getInternals>[0])
			.amplify as unknown as AmplifyContext;

		await ctx.fetchAuthSession({ forceRefresh: true });

		// Each auth operation resolves a FRESH per-request context via the
		// runner (per-request isolation), bound to the client's cookies.
		expect(mockRunWithAmplifyServerContext).toHaveBeenCalledWith(
			expect.objectContaining({ nextServerContext: { cookies } }),
		);
		expect(innerFetchAuthSession).toHaveBeenCalledWith({
			forceRefresh: true,
		});
	});
});

describe('generateServerClient', () => {
	afterAll(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});

	it('should call getAmlifyConfig', async () => {
		generateServerClientUsingReqRes({ config: mockAmplifyConfig });
		expect(mockParseAmplifyConfig).toHaveBeenCalled();
	});

	// TODO: figure out proper mocks and unskip
	it.skip('wrapped client.graphql should pass context through', async () => {
		const { runWithAmplifyServerContext } = createServerRunnerForAPI({
			config: mockAmplifyConfig,
		});
		const mockedReq = new NextApiRequestMock();
		const mockedRes = NextApiResponseMock;

		const mockGraphql = jest.fn();

		jest.mock('@aws-amplify/api-graphql/internals', () => ({
			graphql: mockGraphql,
		}));

		const client = generateServerClientUsingReqRes({
			config: mockAmplifyConfig,
		});

		await runWithAmplifyServerContext({
			nextServerContext: {
				request: mockedReq,
				response: mockedRes,
			},
			operation: async contextSpec => {
				await client.graphql(contextSpec, { query: '' });
			},
		});

		expect(mockGraphql).toHaveBeenCalled();
	});
});
