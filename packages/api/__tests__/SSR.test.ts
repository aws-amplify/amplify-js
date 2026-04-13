import { enableFetchMocks } from 'jest-fetch-mock';
import { configure, ResourcesConfig } from 'aws-amplify';

// allows SSR function to be invoked without catastrophically failing out of the gate.
enableFetchMocks();

// Polyfill structuredClone for jsdom environment
if (typeof globalThis.structuredClone === 'undefined') {
	globalThis.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

const generateClientSpy = jest.fn();
jest.mock('@aws-amplify/api-graphql/internals', () => ({
	...jest.requireActual('@aws-amplify/api-graphql/internals'),
	generateClient: generateClientSpy,
}));

const {
	generateServerClientUsingCookies,
	generateServerClientUsingReqRes,
} = require('@aws-amplify/adapter-nextjs/api');

let mockCtx: any;

describe('SSR internals', () => {
	beforeEach(() => {
		mockCtx = configure(
			{
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'a-key',
						endpoint: 'https://an-endpoint.local/graphql',
						region: 'north-pole-7',
					},
				},
				Auth: {
					Cognito: {
						userPoolId: 'north-pole-7:santas-little-helpers',
						identityPoolId: 'north-pole-7:santas-average-sized-helpers',
						userPoolClientId: 'the-mrs-claus-oversight-committee',
					},
				},
			}
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const cookies = () => ({
		get() { return undefined },
		getAll() { return [] },
		has() { return false },
	}) as any;

	test('generateServerClientUsingCookies passes through to generateClient', () => {
		generateClientSpy.mockReturnValue('generated client');

		const options = {
			config: mockCtx.resourcesConfig,
			cookies: cookies,
			authMode: "authMode value",
			authToken: "authToken value",
			apiKey: "apiKey value",
			endpoint: "endpoint value",
			headers: "headers value"
		} as any;

		const client = generateServerClientUsingCookies(options);

		expect(generateClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				authMode: "authMode value",
				authToken: "authToken value",
				apiKey: "apiKey value",
				endpoint: "endpoint value",
				headers: "headers value",
			})
		);
		expect(client).toEqual('generated client');
	});

	test('generateServerClientUsingReqRes passes through to generateClient', () => {
		generateClientSpy.mockReturnValue('generated client');

		const options = {
			config: mockCtx.resourcesConfig,
			authMode: "authMode value",
			authToken: "authToken value",
			apiKey: "apiKey value",
			endpoint: "endpoint value",
			headers: "headers value"
		} as any;

		const client = generateServerClientUsingReqRes(options);

		expect(generateClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				authMode: "authMode value",
				authToken: "authToken value",
				apiKey: "apiKey value",
				endpoint: "endpoint value",
				headers: "headers value",
			})
		);
		expect(client).toEqual('generated client');
	});
})
