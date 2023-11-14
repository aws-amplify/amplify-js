import { ResourcesConfig } from '@aws-amplify/core';
import {
	generateServerClientUsingCookies,
	generateServerClientUsingReqRes,
} from '../../src/api';
import {
	getAmplifyConfig,
	createRunWithAmplifyServerContext,
} from '../../src/utils';
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
	getAmplifyConfig: jest.fn(() => mockAmplifyConfig),
	createCookieStorageAdapterFromNextServerContext: jest.fn(),
}));

jest.mock('aws-amplify/adapter-core');

const mockGetAmplifyConfig = getAmplifyConfig as jest.Mock;
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
		}).toThrowError();
	});

	it('should call createRunWithAmplifyServerContext to create runWithAmplifyServerContext function', async () => {
		const cookies = (await headers).cookies;

		generateServerClientUsingCookies({ config: mockAmplifyConfig, cookies });
		expect(mockCreateRunWithAmplifyServerContext).toHaveBeenCalledWith({
			config: mockAmplifyConfig,
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
		expect(mockGetAmplifyConfig).toHaveBeenCalled();
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

		jest.mock('@aws-amplify/core/internals/adapter-core', () => ({
			getAmplifyServerContext: () => {},
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
