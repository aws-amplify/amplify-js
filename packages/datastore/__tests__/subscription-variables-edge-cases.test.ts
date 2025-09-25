import { SubscriptionProcessor } from '../src/sync/processors/subscription';
import { TransformerMutationType } from '../src/sync/utils';
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

			const processor = new SubscriptionProcessor(
				schema,
				new WeakMap(),
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				{
					subscriptionVariables: {
						Todo: () => sharedObject,
					},
				},
			);

			// First call
			// @ts-ignore
			const result1 = processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
			);

			// Mutate the shared object
			sharedObject.storeId = 'mutated';

			// Second call - should get cached value, not mutated
			// @ts-ignore
			const result2 = processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
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

			const processor = new SubscriptionProcessor(
				schema,
				new WeakMap(),
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				{
					subscriptionVariables: {
						Todo: () => circular,
					},
				},
			);

			// Should handle circular reference without crashing
			// @ts-ignore
			const result = processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
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
				const processor = new SubscriptionProcessor(
					schema,
					new WeakMap(),
					{},
					'DEFAULT' as any,
					jest.fn(),
					{ InternalAPI: { graphql: mockGraphQL } } as any,
					{
						subscriptionVariables: {
							Todo: value as any,
						},
					},
				);

				// @ts-ignore
				const result = processor.getSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
				);

				expect(result).toBeUndefined();
			});
		});

		it('should handle Object.create(null) objects', () => {
			const schema = createTestSchema();
			const nullProtoObj = Object.create(null);
			nullProtoObj.storeId = 'test';

			const processor = new SubscriptionProcessor(
				schema,
				new WeakMap(),
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				{
					subscriptionVariables: {
						Todo: nullProtoObj,
					},
				},
			);

			// @ts-ignore
			const result = processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
			);

			expect(result).toBeDefined();
			expect(result?.storeId).toBe('test');
		});

		it('should handle function that throws', () => {
			const schema = createTestSchema();

			const processor = new SubscriptionProcessor(
				schema,
				new WeakMap(),
				{},
				'DEFAULT' as any,
				jest.fn(),
				{ InternalAPI: { graphql: mockGraphQL } } as any,
				{
					subscriptionVariables: {
						Todo: () => {
							throw new Error('Function error');
						},
					},
				},
			);

			// Should not crash
			// @ts-ignore
			const result = processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
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
				const processor = new SubscriptionProcessor(
					schema,
					new WeakMap(),
					{},
					'DEFAULT' as any,
					jest.fn(),
					{ InternalAPI: { graphql: mockGraphQL } } as any,
					{
						subscriptionVariables: {
							Todo: () => value,
						},
					},
				);

				// @ts-ignore
				const result = processor.getSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
				);

				expect(result).toBeUndefined();
			});
		});
	});

	describe('Cache Behavior', () => {
		it('should only call function once per operation', () => {
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

			// Call multiple times for same operation
			for (let i = 0; i < 5; i++) {
				// @ts-ignore
				processor.getSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
				);
			}

			// Should only be called once
			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith(TransformerMutationType.CREATE);

			// Call for different operation
			// @ts-ignore
			processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.UPDATE,
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
			// @ts-ignore
			processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
			);
			expect(mockFn).toHaveBeenCalledTimes(1);

			// Stop processor (clears cache)
			await processor.stop();

			// Call again after stop
			// @ts-ignore
			processor.getSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
			);

			// Should be called again since cache was cleared
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});
});