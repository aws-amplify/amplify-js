import { TransformerMutationType, processSubscriptionVariables } from '../src/sync/utils';
import { InternalSchema } from '../src/types';

describe('Subscription Variables - Edge Cases & Safety', () => {
	beforeEach(() => {
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

	describe('Invalid Input Handling', () => {
		it('should reject non-object static variables', () => {
			const schema = createTestSchema();

			const testCases = [
				{ value: 'string', desc: 'string' },
				{ value: 123, desc: 'number' },
				{ value: true, desc: 'boolean' },
				{ value: ['array'], desc: 'array' },
			];

			testCases.forEach(({ value }) => {
				const result = processSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
					value as any,
				);

				expect(result).toBeUndefined();
			});
		});

		it('should handle Object.create(null) objects', () => {
			const schema = createTestSchema();
			const nullProtoObj = Object.create(null);
			nullProtoObj.storeId = 'test';

			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				nullProtoObj,
			);

			expect(result).toBeDefined();
			expect(result?.storeId).toBe('test');
		});

		it('should handle function that throws', () => {
			const schema = createTestSchema();

			const mockFn = () => {
				throw new Error('Function error');
			};
			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				mockFn,
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

			testCases.forEach(({ value }) => {
				const mockFn = () => value;
				const result = processSubscriptionVariables(
					schema.namespaces.user.models.Todo,
					TransformerMutationType.CREATE,
					mockFn as any,
				);

				expect(result).toBeUndefined();
			});
		});
	});

	describe('Reserved Variable Filtering', () => {
		it('should filter reserved names and keep custom ones', () => {
			const schema = createTestSchema();

			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				{ storeId: 'store-1', filter: 'should-be-removed', owner: 'should-be-removed' },
			);

			expect(result).toEqual({ storeId: 'store-1' });
		});

		it('should return undefined when all variables are reserved', () => {
			const schema = createTestSchema();

			const result = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				{ filter: 'x', owner: 'y' },
			);

			expect(result).toBeUndefined();
		});
	});

	describe('Function Variables', () => {
		it('should call function with operation type', () => {
			const schema = createTestSchema();
			const mockFn = jest.fn(() => ({ storeId: 'test' }));

			processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				mockFn,
			);

			expect(mockFn).toHaveBeenCalledWith(TransformerMutationType.CREATE);
		});

		it('should return different results per operation', () => {
			const schema = createTestSchema();
			const mockFn = jest.fn((op: string) => ({ op, storeId: 'test' }));

			const createResult = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.CREATE,
				mockFn,
			);

			const updateResult = processSubscriptionVariables(
				schema.namespaces.user.models.Todo,
				TransformerMutationType.UPDATE,
				mockFn,
			);

			expect(createResult?.op).toBe(TransformerMutationType.CREATE);
			expect(updateResult?.op).toBe(TransformerMutationType.UPDATE);
		});
	});
});
