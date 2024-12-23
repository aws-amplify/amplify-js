import { enableFetchMocks } from 'jest-fetch-mock';
import { Amplify, ResourcesConfig } from 'aws-amplify';

// allows SSR function to be invoked without catastrophically failing out of the gate.
enableFetchMocks();

const generateClientWithAmplifyInstanceSpy = jest.fn();
jest.mock('@aws-amplify/api/internals', () => ({
	generateClientWithAmplifyInstance: generateClientWithAmplifyInstanceSpy
}));

const generateClientSpy = jest.fn();
jest.mock('aws-amplify/api/server', () => ({
	generateClient: generateClientSpy
}));

const {
	generateServerClientUsingCookies,
	generateServerClientUsingReqRes,
} = require('@aws-amplify/adapter-nextjs/api');

describe('SSR internals', () => {
	beforeEach(() => {
		Amplify.configure(
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

	test('generateServerClientUsingCookies passes through to generateClientWithAmplifyInstance', () => {
		generateClientWithAmplifyInstanceSpy.mockReturnValue('generateClientWithAmplifyInstance client');

		const options = {
			config: Amplify.getConfig(),
			cookies: cookies, // must be a function to internal sanity checks
			authMode: "authMode value",
			authToken: "authToken value",
			apiKey: "apiKey value",
			endpoint: "endpoint value",
			headers: "headers value"
		} as any;

		const {
			config: _config, // config is replaced with resources config
			cookies: _cookies, // cookies are not sent
			...params
		} = options;

		const client = generateServerClientUsingCookies(options);

		expect(generateClientWithAmplifyInstanceSpy).toHaveBeenCalledWith(
			expect.objectContaining(params)
		);
		expect(client).toEqual('generateClientWithAmplifyInstance client');
	});

	test('generateServerClientUsingReqRes passes through to generateClientSpy', () => {
		generateClientSpy.mockReturnValue('generateClientSpy client');

		const options = {
			config: Amplify.getConfig(),
			authMode: "authMode value",
			authToken: "authToken value",
			apiKey: "apiKey value",
			endpoint: "endpoint value",
			headers: "headers value"
		} as any;

		const {
			config: _config, // config is replaced with resources config
			...params
		} = options;

		const client = generateServerClientUsingReqRes(options);

		expect(generateClientSpy).toHaveBeenCalledWith(
			expect.objectContaining(params)
		);
		expect(client).toEqual('generateClientSpy client');
	});
})