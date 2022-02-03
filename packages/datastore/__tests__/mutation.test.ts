import { MutationProcessor } from '../src/sync/processors/mutation';
import {
	Model as ModelType,
	PostCustomPK as PostCustomPKType,
	PostCustomPKSort as PostCustomPKSortType,
	testSchema,
	internalTestSchema,
} from './helpers';
import {
	PersistentModelConstructor,
	InternalSchema,
	OpType,
} from '../src/types';
import { createMutationInstanceFromModelOperation } from '../src/sync/utils';
import { MutationEvent } from '../src/sync/';

let syncClasses: any;
let modelInstanceCreator: any;
let Model: PersistentModelConstructor<ModelType>;
let PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
let PostCustomPKSort: PersistentModelConstructor<PostCustomPKSortType>;

describe('MutationProcessor', () => {
	let mutationProcessor: MutationProcessor;

	beforeAll(async () => {
		mutationProcessor = await instantiateMutationProcessor();
	});

	// Test for this PR: https://github.com/aws-amplify/amplify-js/pull/6542
	describe('100% Packet Loss Axios Error', () => {
		it('Should result in Network Error and get handled without breaking the Mutation Processor', async () => {
			const mutationProcessorSpy = jest.spyOn(mutationProcessor, 'resume');

			await mutationProcessor.resume();

			expect(mockJitteredExponentialRetry.mock.results).toHaveLength(1);

			await expect(
				mockJitteredExponentialRetry.mock.results[0].value
			).rejects.toEqual(new Error('Network Error'));

			expect(mutationProcessorSpy).toHaveBeenCalled();

			// MutationProcessor.resume exited successfully, i.e., did not throw
			await expect(mutationProcessorSpy.mock.results[0].value).resolves.toEqual(
				undefined
			);
		});
	});
	describe('createQueryVariables', () => {
		it('Should correctly generate delete mutation input for models with a custom PK', async () => {
			// custom PK @key(fields: ["postId"])
			const deletePost = new PostCustomPK({
				postId: 100,
				title: 'Title',
			});

			const { data } = await createMutationEvent(deletePost, OpType.DELETE);

			const [, { input }] = (mutationProcessor as any).createQueryVariables(
				'user',
				'PostCustomPK',
				'Delete',
				data,
				'{}'
			);

			expect(input.postId).toEqual(100);
			expect(input.id).toBeUndefined();
		});

		it('Should correctly generate delete mutation input for models with a custom PK - multi-field', async () => {
			// multi-key PK @key(fields: ["id", "postId"])
			const deletePost = new PostCustomPKSort({
				postId: 100,
				title: 'Title',
			});

			const { data } = await createMutationEvent(deletePost, OpType.DELETE);

			const [, { input }] = (mutationProcessor as any).createQueryVariables(
				'user',
				'PostCustomPKSort',
				'Delete',
				data,
				'{}'
			);

			expect(input.id).toEqual(deletePost.id);
			expect(input.postId).toEqual(100);
		});
	});
	afterAll(() => {
		jest.restoreAllMocks();
	});
});

// Mocking restClient.post to throw the error we expect
// when experiencing poor network conditions
jest.mock('@aws-amplify/api-rest', () => {
	return {
		...jest.requireActual('@aws-amplify/api-rest'),
		RestClient() {
			return {
				post: jest.fn().mockImplementation(() => {
					return Promise.reject(axiosError);
				}),
				getCancellableToken: () => {},
				updateRequestToBeCancellable: () => {},
				isCancel: () => false,
			};
		},
	};
});

// Configuring the API category so that API.graphql can be used
// by the MutationProcessor
jest.mock('@aws-amplify/api', () => {
	const awsconfig = {
		aws_project_region: 'us-west-2',
		aws_appsync_graphqlEndpoint:
			'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
		aws_appsync_region: 'us-west-2',
		aws_appsync_authenticationType: 'API_KEY',
		aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxx',
	};

	const { GraphQLAPIClass } = jest.requireActual('@aws-amplify/api-graphql');
	const graphqlInstance = new GraphQLAPIClass(null);
	graphqlInstance.configure(awsconfig);

	return {
		graphql: graphqlInstance.graphql.bind(graphqlInstance),
	};
});

// mocking jitteredExponentialRetry to prevent it from retrying
// endlessly in the mutation processor and so that we can expect the thrown result in our test
// should throw a Network Error
let mockJitteredExponentialRetry;
jest.mock('@aws-amplify/core', () => {
	mockJitteredExponentialRetry = jest
		.fn()
		.mockImplementation(async (fn, args) => {
			await fn(...args);
		});
	return {
		...jest.requireActual('@aws-amplify/core'),
		jitteredExponentialRetry: mockJitteredExponentialRetry,
	};
});

// Mocking just enough dependencies for us to be able to
// instantiate a working MutationProcessor
// includes functional mocked outbox containing a single MutationEvent
async function instantiateMutationProcessor() {
	let schema: InternalSchema = internalTestSchema();

	jest.doMock('../src/sync/', () => ({
		SyncEngine: {
			getNamespace: () => schema.namespaces['sync'],
		},
	}));

	const { initSchema, DataStore } = require('../src/datastore/datastore');
	const classes = initSchema(testSchema());

	({ Model, PostCustomPK, PostCustomPKSort } = classes as {
		Model: PersistentModelConstructor<ModelType>;
		PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
		PostCustomPKSort: PersistentModelConstructor<PostCustomPKSortType>;
	});

	const userClasses = {};
	userClasses['Model'] = Model;
	userClasses['PostCustomPK'] = PostCustomPK;
	userClasses['PostCustomPKSort'] = PostCustomPKSort;

	await DataStore.start();
	({ syncClasses } = require('../src/datastore/datastore'));
	({ modelInstanceCreator, schema } = (DataStore as any).storage.storage);

	const newModel = new Model({
		field1: 'Some value',
		dateCreated: new Date().toISOString(),
	});

	const newMutationEvent = createMutationEvent(newModel, OpType.INSERT);
	// mocking mutation queue with a single event
	const mutationQueue = [newMutationEvent];

	const outbox = {
		peek: () => {
			return mutationQueue[0];
		},
		dequeue: () => {
			mutationQueue.pop();
		},
	};

	const storage = {
		runExclusive: (fn) => fn(),
	};

	const mutationProcessor = new MutationProcessor(
		schema,
		storage as any,
		userClasses,
		outbox as any,
		modelInstanceCreator,
		{} as any,
		{
			aws_project_region: 'us-west-2',
			aws_appsync_graphqlEndpoint:
				'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
			aws_appsync_region: 'us-west-2',
			aws_appsync_authenticationType: 'API_KEY',
			aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxx',
		},
		() => null
	);

	(mutationProcessor as any).observer = true;

	return mutationProcessor;
}

// Creates MutationEvent instance that can be added to the outbox
async function createMutationEvent(model, opType): Promise<MutationEvent> {
	const MutationEventConstructor = syncClasses[
		'MutationEvent'
	] as PersistentModelConstructor<MutationEvent>;

	const modelConstructor = (Object.getPrototypeOf(model) as Object)
		.constructor as PersistentModelConstructor<any>;

	return createMutationInstanceFromModelOperation(
		undefined!,
		undefined!,
		opType,
		modelConstructor,
		model,
		{},
		MutationEventConstructor,
		modelInstanceCreator
	);
}

// expected error when experiencing 100% packet loss
const axiosError = {
	message: 'timeout of 0ms exceeded',
	name: 'Error',
	stack:
		'Error: timeout of 0ms exceeded\n    at createError (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:265622:17)\n    at EventTarget.handleTimeout (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:265537:16)\n    at EventTarget.dispatchEvent (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:32460:27)\n    at EventTarget.setReadyState (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:31623:20)\n    at EventTarget.__didCompleteResponse (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:31443:16)\n    at http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:31553:47\n    at RCTDeviceEventEmitter.emit (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:7202:37)\n    at MessageQueue.__callFunction (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:2813:31)\n    at http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:2545:17\n    at MessageQueue.__guard (http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false:2767:13)',
	config: {
		url: 'https://xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com/graphql',
		method: 'post',
		data: '{"query":"mutation operation($input: UpdatePostInput!, $condition: ModelPostConditionInput) {  updatePost(input: $input, condition: $condition) {    id    title    rating    status    _version    _lastChangedAt    _deleted    blog {      id      _deleted    }  }}","variables":{"input":{"id":"86e8f2c1-b002-4ff2-92a2-3dad37933477","status":"INACTIVE","_version":1},"condition":null}}',
		headers: {
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json; charset=UTF-8',
			'User-Agent': 'aws-amplify/3.8.21 react-native',
			'X-Api-Key': 'da2-xxxxxxxxxxxxxxxxxxxxxx',
			'x-amz-user-agent': 'aws-amplify/3.8.21 react-native',
		},
		transformRequest: [null],
		transformResponse: [null],
		timeout: 0,
		responseType: 'json',
		xsrfCookieName: 'XSRF-TOKEN',
		xsrfHeaderName: 'X-XSRF-TOKEN',
		maxContentLength: -1,
		maxBodyLength: -1,
		cancelToken: {
			promise: {
				_U: 1,
				_V: 0,
				_W: null,
				_X: {
					onRejected: null,
					promise: {
						_U: 0,
						_V: 0,
						_W: null,
						_X: null,
					},
				},
			},
		},
		host: 'xxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-west-2.amazonaws.com',
		path: '/graphql',
		signerServiceInfo: {
			service: 'appsync',
			region: 'us-west-2',
		},
	},
	code: 'ECONNABORTED',
};
