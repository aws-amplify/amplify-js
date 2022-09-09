import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { Schema } from '../src/types';
const FDBFactory = require('fake-indexeddb/lib/FDBFactory');

const awsconfig = {
	aws_appsync_graphqlEndpoint:
		'https://xxxx.appsync-api.us-west-2.amazonaws.com/graphql',
	aws_appsync_authenticationType: 'AWS_IAM',
};

/* 
	These tests ensure that DataStore will always use the default auth mode,
	i.e., `aws_appsync_authenticationType` when multi-auth is NOT enabled
	regardless of any auth metadata in the MIPR
*/
describe('CMS usecases', () => {
	let gqlMock: jest.Mock<any>;

	beforeEach(() => {
		gqlMock = mockDependencies();
	});

	afterEach(() => {
		indexedDB = new FDBFactory(); // wipe in-memory IDB
		jest.resetModules(); // allows us to `initSchema` with different schemas between runs
		gqlMock.mockClear();
	});

	test('default auth - no auth modes in MIPR', async () => {
		expect.assertions(2);

		const { DataStore } = getDataStore(noAuthModeSchema());
		DataStore.configure(awsconfig as any);

		await DataStore.start();
		await new Promise(res => setTimeout(res, 10));

		expect(gqlMock).toHaveBeenCalledTimes(2);
		expect(gqlMock).toHaveBeenCalledWith(
			expect.objectContaining({
				authMode: 'AWS_IAM',
			})
		);
	});

	test('default auth - other auth modes in MIPR', async () => {
		expect.assertions(2);

		const { DataStore } = getDataStore(ownerAuthModeSchema());
		DataStore.configure(awsconfig as any);

		await DataStore.start();
		await new Promise(res => setTimeout(res, 10));

		expect(gqlMock).toHaveBeenCalledTimes(2);
		expect(gqlMock).toHaveBeenCalledWith(
			expect.objectContaining({
				authMode: 'AWS_IAM',
			})
		);
	});
});

function mockDependencies(): jest.Mock<any> {
	// mock API.graphql to always return an empty syncPosts response
	const gqlMock: jest.Mock<any> = jest.fn(() => {
		return Promise.resolve({
			data: {
				syncPosts: {
					items: [],
					nextToken: null,
					startedAt: Date.now(),
				},
			},
		});
	});

	jest.mock('@aws-amplify/api', () => {
		return {
			graphql: gqlMock,
		};
	});

	jest.mock('@aws-amplify/auth', () => ({
		currentAuthenticatedUser: () => {
			return Promise.resolve(true);
		},
		GRAPHQL_AUTH_MODE:
			jest.requireActual('@aws-amplify/auth').GRAPHQL_AUTH_MODE,
	}));

	return gqlMock;
}

function getDataStore(schema: Schema) {
	const {
		initSchema,
		DataStore,
	}: {
		initSchema: typeof initSchemaType;
		DataStore: typeof DataStoreType;
	} = require('../src/datastore/datastore');

	initSchema(schema);

	return {
		DataStore,
	};
}

function noAuthModeSchema(): Schema {
	return {
		enums: {},
		models: {
			Post: {
				name: 'Post',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Posts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
		},
		version: '1',
	};
}

function ownerAuthModeSchema(): Schema {
	return {
		enums: {},
		models: {
			Post: {
				name: 'Post',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Posts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									provider: 'userPools',
									ownerField: 'owner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
			},
		},
		version: '2',
	};
}
