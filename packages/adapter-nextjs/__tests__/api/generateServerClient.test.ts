import { ResourcesConfig } from 'aws-amplify';
import { parseAmplifyConfig } from 'aws-amplify/utils';

import {
	generateServerClientUsingCookies,
	generateServerClientUsingReqRes,
} from '../../src/api';
import { NextApiRequestMock, NextApiResponseMock } from '../mocks/headers';

const _headers = import('next/headers.js');
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

// Polyfill structuredClone for test environment
if (!globalThis.structuredClone) {
	globalThis.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

jest.mock('aws-amplify/utils', () => ({
	...jest.requireActual('aws-amplify/utils'),
	parseAmplifyConfig: jest.fn(() => mockAmplifyConfig),
}));

jest.mock('aws-amplify/api/internals', () => ({
	...jest.requireActual('aws-amplify/api/internals'),
	generateClient: jest.fn(() => ({ graphql: jest.fn() })),
}));

const mockParseAmplifyConfig = parseAmplifyConfig as jest.Mock;

describe('generateServerClientUsingCookies', () => {
	it('should throw error when used with req/res', async () => {
		const mockedReq = new NextApiRequestMock();
		const mockedRes = NextApiResponseMock;

		expect(() => {
			(generateServerClientUsingCookies as any)({
				request: mockedReq,
				response: mockedRes,
			});
		}).toThrow();
	});
});

describe('generateServerClientUsingReqRes', () => {
	afterAll(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});

	it('should call parseAmplifyConfig', async () => {
		generateServerClientUsingReqRes({ config: mockAmplifyConfig });
		expect(mockParseAmplifyConfig).toHaveBeenCalled();
	});
});
