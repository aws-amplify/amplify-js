import {
	SchemaModel,
	ModelIntrospectionSchema,
} from '@aws-amplify/core/internals/utils';
import {
	normalizeMutationInput,
	flattenItems,
	generateSelectionSet,
	customSelectionSetToIR,
	generateGraphQLDocument,
} from '../../src/internals/APIClient';

import config from '../fixtures/modeled/amplifyconfiguration';
import {
	productSchemaModel,
	userSchemaModel,
} from '../fixtures/schema-models/with-custom-primary-key/models';
const modelIntroSchema = config.modelIntrospection as ModelIntrospectionSchema;

describe('APIClient', () => {
	describe('normalizeMutationInput', () => {
		// TODO: test all relationship combinations
		test('basic 1:M mutation', () => {
			const todo = {
				id: 'todo1',
				name: 'My Todo',
			};

			const note = {
				body: 'Note about Todo',
				// passing model
				todo: todo,
			};

			const expectedInput = {
				body: note.body,
				// expecting id
				todoNotesId: todo.id,
			};

			const noteModelDef = modelIntroSchema.models.Note as SchemaModel;

			const normalized = normalizeMutationInput(
				note,
				noteModelDef,
				modelIntroSchema
			);

			expect(normalized).toEqual(expectedInput);
		});
	});
});

describe('flattenItems', () => {
	test('no-op on get without relationships', () => {
		const getResponse = { getPost: { id: 'myPost' } };

		const expected = { getPost: { id: 'myPost' } };

		const flattened = flattenItems(getResponse);

		expect(flattened).toEqual(expected);
	});

	test('flatten list without relationships', () => {
		const listResponse = {
			listPost: { items: [{ id: 'myPost' }, { id: 'myPost2' }] },
		};

		const expected = {
			listPost: [{ id: 'myPost' }, { id: 'myPost2' }],
		};

		const flattened = flattenItems(listResponse);

		expect(flattened).toEqual(expected);
	});

	test('flatten list with relationships', () => {
		const listResponse = {
			listPosts: {
				items: [
					{
						id: 'post1',
						comments: {
							items: [
								{
									id: 'comment1',
									content: 'my comment 1',
									meta: {
										items: [{ id: 'meta1' }],
									},
									post: {
										id: 'post1',
										comments: {
											items: [
												{
													id: 'comment1',
													content: 'my comment 1',
													meta: {
														items: [{ id: 'meta1' }],
													},
												},
											],
										},
									},
								},
								{
									id: 'comment1',
									content: 'my comment 1',
									meta: {
										items: [{ id: 'meta1' }],
									},
								},
							],
						},
					},
				],
			},
		};

		const expected = {
			listPosts: [
				{
					id: 'post1',
					comments: [
						{
							id: 'comment1',
							content: 'my comment 1',
							meta: [
								{
									id: 'meta1',
								},
							],
							post: {
								id: 'post1',
								comments: [
									{
										id: 'comment1',
										content: 'my comment 1',
										meta: [
											{
												id: 'meta1',
											},
										],
									},
								],
							},
						},
						{
							id: 'comment1',
							content: 'my comment 1',
							meta: [
								{
									id: 'meta1',
								},
							],
						},
					],
				},
			],
		};

		const flattened = flattenItems(listResponse);

		expect(flattened).toEqual(expected);
	});

	describe('customSelectionSetToIR', () => {
		test('specific fields on the model', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'Todo', [
				'id',
				'name',
			]);

			const expected = {
				id: '',
				name: '',
			};

			expect(selSet).toEqual(expected);
		});

		test('specific fields on the model and related model', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.id',
				'notes.body',
			]);

			const expected = {
				id: '',
				name: '',
				notes: {
					items: {
						id: '',
						body: '',
					},
				},
			};

			expect(selSet).toEqual(expected);
		});

		test('related property without any specified field in selectionSet should throw an error', () => {
			expect(() =>
				customSelectionSetToIR(modelIntroSchema, 'Todo', [
					'id',
					'name',
					'notes',
				])
			).toThrow('notes must declare a wildcard (*) or a field of model Note');
		});

		test('inexistent field should throw an error', () => {
			expect(() =>
				customSelectionSetToIR(modelIntroSchema, 'Todo', [
					'id',
					'name',
					'inexistentField',
					'notes.*',
				])
			).toThrow('inexistentField is not a field of model Todo');
		});

		test('related inexistent field should throw an error', () => {
			expect(() =>
				customSelectionSetToIR(modelIntroSchema, 'Todo', [
					'id',
					'name',
					'notes.inexistentField',
				])
			).toThrow('inexistentField is not a field of model Note');
		});

		test('specific fields on the model; all fields on related model', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.*',
			]);

			const expected = {
				id: '',
				name: '',
				notes: {
					items: {
						id: '',
						body: '',
						owner: '',
						createdAt: '',
						updatedAt: '',
						todoNotesId: '',
					},
				},
			};

			expect(selSet).toEqual(expected);
		});

		test('deeply nested on a bi-directional model', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.todo.notes.todo.notes.todo.notes.*',
			]);

			const expected = {
				id: '',
				name: '',
				notes: {
					items: {
						todo: {
							notes: {
								items: {
									todo: {
										notes: {
											items: {
												todo: {
													notes: {
														items: {
															id: '',
															body: '',
															createdAt: '',
															updatedAt: '',
															todoNotesId: '',
															owner: '',
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			};

			expect(selSet).toEqual(expected);
		});

		test("subsequent wildcard doesn't overwrite existing nested object", () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.todo.name',
				'notes.*',
			]);

			const expected = {
				id: '',
				name: '',
				notes: {
					items: {
						id: '',
						body: '',
						createdAt: '',
						updatedAt: '',
						todoNotesId: '',
						owner: '',
						todo: {
							name: '',
						},
					},
				},
			};

			expect(selSet).toEqual(expected);
		});

		test('custom type works properly', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'CommunityPost', [
				'metadata.type',
				'poll.question',
			]);

			const expected = {
				metadata: {
					type: '',
				},
				poll: {
					question: '',
				},
			};

			expect(selSet).toEqual(expected);
		});

		test('custom type with wildcard works properly', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'CommunityPost', [
				'metadata.*',
				'poll.question',
			]);

			const expected = {
				metadata: {
					type: '',
					deleted: '',
				},
				poll: {
					question: '',
				},
			};

			expect(selSet).toEqual(expected);
		});

		test('custom type with invalid property throws an error', () => {
			expect(() =>
				customSelectionSetToIR(modelIntroSchema, 'CommunityPost', [
					'metadata.inexistentField',
					'poll.question',
				])
			).toThrow(
				'inexistentField is not a field of custom type CommunityPostMetadata'
			);
		});

		test('custom type without any properties throws an error', () => {
			expect(() =>
				customSelectionSetToIR(modelIntroSchema, 'CommunityPost', [
					'metadata',
					'poll.question',
				])
			).toThrow(
				'metadata must declare a wildcard (*) or a field of custom type CommunityPostMetadata'
			);
		});

		test('mix of related and non-related fields in a nested model creates a nested object with all necessary fields', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema, 'CommunityPost', [
				'poll.question',
				'poll.answers.answer',
				'poll.answers.votes.id',
			]);

			const expected = {
				poll: {
					question: '',
					answers: {
						items: {
							answer: '',
							votes: {
								items: {
									id: '',
								},
							},
						},
					},
				},
			};

			expect(selSet).toEqual(expected);
		});

		it('generates expected default selection set for nested model and custom type', () => {
			const set = customSelectionSetToIR(modelIntroSchema, 'Warehouse', [
				'id',
				'name',
				'products.*'
			]);

			const expected = {
				id: '',
				name: '',
				products: {
					items: {
						createdAt: '',
						updatedAt: '',
						warehouseProductsId: '',
						description: '',
						factoryId: '',
						owner: '',
						sku: '',
						trackingMeta: {
							note: '',
							productMeta: {
								deepMeta: {
									content: '',
								},
								releaseDate: '',
								status: '',
							}
						}
					}
				}
			}

			expect(set).toEqual(expected);
		});
	});

	describe('generateSelectionSet', () => {
		test('it should generate default selection set', () => {
			const selSet = generateSelectionSet(modelIntroSchema, 'Todo');

			const expected =
				'id name description status tags createdAt updatedAt todoMetaId owner';

			expect(selSet).toEqual(expected);
		});

		it('generates default selection set for nested custom types', () => {
			const generated = generateSelectionSet(modelIntroSchema, 'Product');

			const expected =
				'sku factoryId description trackingMeta { productMeta { releaseDate status deepMeta { content } } note } warehouseProductsId createdAt updatedAt owner';

			expect(generated).toEqual(expected);
		});

		test('it should generate custom selection set - top-level fields', () => {
			const selSet = generateSelectionSet(modelIntroSchema, 'Todo', [
				'id',
				'name',
			]);

			const expected = 'id name';

			expect(selSet).toEqual(expected);
		});

		test('it should generate custom selection set - specific nested fields', () => {
			const selSet = generateSelectionSet(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.id',
				'notes.createdAt',
			]);

			const expected = 'id name notes { items { id createdAt } }';

			expect(selSet).toEqual(expected);
		});

		test('it should generate custom selection set - all nested fields', () => {
			const selSet = generateSelectionSet(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.*',
			]);

			const expected =
				'id name notes { items { id body createdAt updatedAt todoNotesId owner } }';

			expect(selSet).toEqual(expected);
		});

		test('deeply nested on a bi-directional model', () => {
			const selSet = generateSelectionSet(modelIntroSchema, 'Todo', [
				'id',
				'name',
				'notes.todo.notes.todo.notes.todo.notes.*',
			]);

			const expected =
				'id name notes { items { todo { notes { items { todo { notes { items { todo { notes { items { id body createdAt updatedAt todoNotesId owner } } } } } } } } } } }';

			expect(selSet).toEqual(expected);
		});

		it('generates custom selection set for nested custom types', () => {
			const generated = generateSelectionSet(modelIntroSchema, 'Product', [
				'sku',
				'trackingMeta.note',
				'trackingMeta.productMeta.status',
				'trackingMeta.productMeta.deepMeta.content',
			]);

			const expected =
				'sku trackingMeta { note productMeta { status deepMeta { content } } }';

			expect(generated).toEqual(expected);
		});
	});
});

describe('generateGraphQLDocument()', () => {
	describe('for `READ` operation', () => {
		const modelOperation = 'READ';
		const mockModelDefinitions = {
			version: 1 as const,
			enums: {},
			nonModels: {},
			models: {
				User: userSchemaModel,
				Product: productSchemaModel,
			},
		};

		test.each([
			['User', '$userId: ID!'],
			['Product', '$sku: String!,$factoryId: String!,$warehouseId: String!'],
		])(
			'generates arguments for model %s to be %s',
			(modelName, expectedArgs) => {
				const document = generateGraphQLDocument(
					mockModelDefinitions,
					modelName,
					modelOperation
				);

				expect(document).toEqual(expect.stringContaining(expectedArgs))
			}
		);
	});
});
