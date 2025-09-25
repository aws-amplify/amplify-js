import { SubscriptionProcessor } from '../src/sync/processors/subscription';
import { TransformerMutationType, processSubscriptionVariables } from '../src/sync/utils';
import { SchemaModel, InternalSchema } from '../src/types';

describe('Subscription Variables - Edge Cases & Safety', () => {
	let mockGraphQL: jest.Mock;

	beforeEach(() => {
		mockGraphQL = jest.fn();
		jest.clearAllMocks();
	});

	const createTestSchema = (): InternalSchema => ({
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
	});

	describe('Mutation Protection', () => {
		it('should not allow mutations to affect cached values', () => {
			const schema = createTestSchema();
			const sharedObject = { storeId: 'initial' };

			// First call
			const cache = new WeakMap();
			const result1 = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				sharedObject,
				cache,
			);

			// Mutate the shared object
			sharedObject.storeId = 'mutated';

			// Second call - should get cached value, not mutated
			const result2 = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				sharedObject,
				cache,
			);

			// Results should be equal (same cached object)
			expect(result1).toEqual(result2);
			// But changing the original shouldn't affect results
			expect(result2?.storeId).not.toBe('mutated');
		});

		it('should handle circular references gracefully', () => {
			const schema = createTestSchema();
			const circular: any = { storeId: 'test' };
			circular.self = circular; // Create circular reference

			// Should handle circular reference without crashing
			const cache = new WeakMap();
			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				circular,
				cache,
			);

			// Should return the object but not cache it (due to JSON.stringify failure)
			expect(result).toBeDefined();
			expect(result?.storeId).toBe('test');
		});
	});

	describe('Invalid Input Handling', () => {
		it('should reject non-object static variables', () => {
			const schema = createTestSchema();

			const testCases = [
				{ value: 'string', desc: 'string' },
				{ value: 123, desc: 'number' },
				{ value: true, desc: 'boolean' },
				{ value: ['array'], desc: 'array' },
			];

			testCases.forEach(({ value, desc }) => {
				const cache = new WeakMap();
				const result = processSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
					value as any,
					cache,
				);

				expect(result).toBeUndefined();
			});
		});

		it('should handle Object.create(null) objects', () => {
			const schema = createTestSchema();
			const nullProtoObj = Object.create(null);
			nullProtoObj.storeId = 'test';

			const cache = new WeakMap();
			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				nullProtoObj,
				cache,
			);

			expect(result).toBeDefined();
			expect(result?.storeId).toBe('test');
		});

		it('should handle function that throws', () => {
			const schema = createTestSchema();

			// Should not crash
			const cache = new WeakMap();
			const mockFn = () => {
				throw new Error('Function error');
			};
			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				mockFn,
				cache,
			);

			expect(result).toBeUndefined();
		});

		it('should handle function returning non-object', () => {
			const schema = createTestSchema();

			const testCases = [
				{ value: null, desc: 'null' },
				{ value: undefined, desc: 'undefined' },
				{ value: 'string', desc: 'string' },
				{ value: 123, desc: 'number' },
				{ value: ['array'], desc: 'array' },
			];

			testCases.forEach(({ value, desc }) => {
				const cache = new WeakMap();
				const mockFn = () => value;
				const result = processSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
					mockFn as any,
					cache,
				);

				expect(result).toBeUndefined();
			});
		});
	});

	describe('Cache Behavior', () => {
		it('should only call function once per operation', () => {
			const schema = createTestSchema();
			const mockFn = jest.fn(() => ({ storeId: 'test' }));

			// Call multiple times for same operation
			const cache = new WeakMap();
			for (let i = 0; i < 5; i++) {
				processSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
					mockFn,
					cache,
				);
			}

			// Should only be called once
			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith(TransformerMutationType.CREATE);

			// Call for different operation
			processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.UPDATE,
				mockFn,
				cache,
			);

			// Should be called again for new operation
			expect(mockFn).toHaveBeenCalledTimes(2);
			expect(mockFn).toHaveBeenCalledWith(TransformerMutationType.UPDATE);
		});

		it('should clear cache on stop', async () => {
			const schema = createTestSchema();
			const mockFn = jest.fn(() => ({ storeId: 'test' }));

			const processor = new SubscriptionProcessor(
				schema,
				new WeakMap(),
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				{
					subscriptionVariables: {
						Todo: mockFn,
					},
				},
			);

			// First call
			let cache = new WeakMap();
			processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				mockFn,
				cache,
			);
			expect(mockFn).toHaveBeenCalledTimes(1);

			// Stop processor (clears cache) - simulate by creating new cache
			await processor.stop();
			cache = new WeakMap();

			// Call again after stop
			processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				mockFn,
				cache,
			);

			// Should be called again since cache was cleared
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});
});