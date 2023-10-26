import { ResourcesConfig } from '@aws-amplify/core';
import {
	generateServerClientUsingCookies,
	generateServerClient,
} from '../../src/api';
import { runWithAmplifyServerContext } from './../../src';
import { getAmplifyConfig } from '../../src/utils';
import { NextApiRequestMock, NextApiResponseMock } from '../mocks/headers';

const headers = import('next/headers');
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
	getAmplifyConfig: jest.fn(() => mockAmplifyConfig),
	createCookieStorageAdapterFromNextServerContext: jest.fn(),
}));

jest.mock('aws-amplify/adapter-core');

const mockGetAmplifyConfig = getAmplifyConfig as jest.Mock;

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

	it('should call getAmlifyConfig', async () => {
		const cookies = (await headers).cookies;

		generateServerClientUsingCookies({ cookies });
		expect(mockGetAmplifyConfig).toHaveBeenCalled();
	});
});

describe('generateServerClient', () => {
	it('should call getAmlifyConfig', async () => {
		generateServerClient();
		expect(mockGetAmplifyConfig).toHaveBeenCalled();
	});

	// TODO: figure out proper mocks and unskip
	it.skip('wrapped client.graphql should pass context through', async () => {
		const mockedReq = new NextApiRequestMock();
		const mockedRes = NextApiResponseMock;

		const mockGraphql = jest.fn();

		jest.mock('@aws-amplify/api-graphql/internals', () => ({
			graphql: mockGraphql,
		}));

		jest.mock('@aws-amplify/core/internals/adapter-core', () => ({
			getAmplifyServerContext: () => {},
		}));

		const client = generateServerClient();

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
