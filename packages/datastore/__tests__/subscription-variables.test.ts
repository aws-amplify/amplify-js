import { Observable } from 'rxjs';
import { SubscriptionProcessor } from '../src/sync/processors/subscription';
import { TransformerMutationType } from '../src/sync/utils';
import { SchemaModel, InternalSchema } from '../src/types';
import { buildSubscriptionGraphQLOperation } from '../src/sync/utils';

describe('DataStore Subscription Variables', () => {
	let mockObservable: Observable<any>;
	let mockGraphQL: jest.Mock;

	beforeEach(() => {
		mockObservable = new Observable(() => {});
		mockGraphQL = jest.fn(() => mockObservable);
	});

	describe('buildSubscriptionGraphQLOperation', () => {
		it('should include custom variables in subscription query', () => {
			const namespace: any = {
				name: 'user',
				models: {},
				relationships: {},
				enums: {},
				nonModels: {},
			};

			const modelDefinition: SchemaModel = {
				name: 'Todo',
				pluralName: 'Todos',
				syncable: true,
				attributes: [],
				fields: {
					id: {
						name: 'id',
						type: 'ID',
						isRequired: true,
						isArray: false,
					},
					title: {
						name: 'title',
						type: 'String',
						isRequired: false,
						isArray: false,
					},
					storeId: {
						name: 'storeId',
						type: 'String',
						isRequired: false,
						isArray: false,
					},
				},
			};

			const customVariables = {
				storeId: 'store123',
				tenantId: 'tenant456',
			};

			const [opType, opName, query] = buildSubscriptionGraphQLOperation(
				namespace,
				modelDefinition,
				TransformerMutationType.CREATE,
				false,
				'',
				false,
				customVariables,
			);

			// Verify operation type and name
			expect(opType).toBe(TransformerMutationType.CREATE);
			expect(opName).toBe('onCreateTodo');

			// Verify that custom variables are included in the query
			expect(query).toContain('$storeId: String');
			expect(query).toContain('$tenantId: String');
			expect(query).toContain('storeId: $storeId');
			expect(query).toContain('tenantId: $tenantId');
		});

		it('should work without custom variables', () => {
			const namespace: any = {
				name: 'user',
				models: {},
				relationships: {},
				enums: {},
				nonModels: {},
			};

			const modelDefinition: SchemaModel = {
				name: 'Todo',
				pluralName: 'Todos',
				syncable: true,
				attributes: [],
				fields: {
					id: {
						name: 'id',
						type: 'ID',
						isRequired: true,
						isArray: false,
					},
					title: {
						name: 'title',
						type: 'String',
						isRequired: false,
						isArray: false,
					},
				},
			};

			const [opType, opName, query] = buildSubscriptionGraphQLOperation(
				namespace,
				modelDefinition,
				TransformerMutationType.CREATE,
				false,
				'',
				false,
			);

			// Verify operation type and name
			expect(opType).toBe(TransformerMutationType.CREATE);
			expect(opName).toBe('onCreateTodo');

			// Verify that no custom variables are included
			expect(query).not.toContain('$storeId');
			expect(query).not.toContain('$tenantId');
		});
	});

	describe('SubscriptionProcessor with custom variables', () => {
		it('should use custom variables from config when building subscriptions', () => {
			const schema: InternalSchema = {
				namespaces: {
					user: {
						name: 'user',
						models: {
							Todo: {
								name: 'Todo',
								pluralName: 'Todos',
								syncable: true,
								attributes: [],
								fields: {
									id: {
										name: 'id',
										type: 'ID',
										isRequired: true,
										isArray: false,
									},
									title: {
										name: 'title',
										type: 'String',
										isRequired: false,
										isArray: false,
									},
									storeId: {
										name: 'storeId',
										type: 'String',
										isRequired: false,
										isArray: false,
									},
								},
							},
						},
						relationships: {},
						enums: {},
						nonModels: {},
					},
				},
				version: '1',
				codegenVersion: '3.0.0',
			};

			const syncPredicates = new WeakMap();
			const datastoreConfig = {
				subscriptionVariables: {
					Todo: {
						storeId: 'store123',
					},
				},
			};

			const processor = new SubscriptionProcessor(
				schema,
				syncPredicates,
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				datastoreConfig,
			);

			// @ts-ignore - accessing private method for testing
			const result = processor.buildSubscription(
				schema.namespaces.user,
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				0,
				undefined,
				'userPool',
				false,
			);

			expect(result.opName).toBe('onCreateTodo');
			expect(result.query).toContain('$storeId: String');
			expect(result.query).toContain('storeId: $storeId');
		});

		it('should support function-based subscription variables', () => {
			const schema: InternalSchema = {
				namespaces: {
					user: {
						name: 'user',
						models: {
							Todo: {
								name: 'Todo',
								pluralName: 'Todos',
								syncable: true,
								attributes: [],
								fields: {
									id: {
										name: 'id',
										type: 'ID',
										isRequired: true,
										isArray: false,
									},
									title: {
										name: 'title',
										type: 'String',
										isRequired: false,
										isArray: false,
									},
									storeId: {
										name: 'storeId',
										type: 'String',
										isRequired: false,
										isArray: false,
									},
								},
							},
						},
						relationships: {},
						enums: {},
						nonModels: {},
					},
				},
				version: '1',
				codegenVersion: '3.0.0',
			};

			const syncPredicates = new WeakMap();
			const datastoreConfig = {
				subscriptionVariables: {
					Todo: (operation: string) => {
						if (operation === TransformerMutationType.CREATE) {
							return { storeId: 'store-create' };
						}
						if (operation === TransformerMutationType.UPDATE) {
							return { storeId: 'store-update' };
						}
						return { storeId: 'store-delete' };
					},
				},
			};

			const processor = new SubscriptionProcessor(
				schema,
				syncPredicates,
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				datastoreConfig,
			);

			// Test CREATE operation
			// @ts-ignore - accessing private method for testing
			const createResult = processor.buildSubscription(
				schema.namespaces.user,
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				0,
				undefined,
				'userPool',
				false,
			);

			expect(createResult.query).toContain('$storeId: String');
			expect(createResult.query).toContain('storeId: $storeId');

			// Test UPDATE operation
			// @ts-ignore - accessing private method for testing
			const updateResult = processor.buildSubscription(
				schema.namespaces.user,
				schema.namespaces.user.models.Todo,
				TransformerMutationType.UPDATE,
				0,
				undefined,
				'userPool',
				false,
			);

			expect(updateResult.query).toContain('$storeId: String');
			expect(updateResult.query).toContain('storeId: $storeId');
		});
	});
});