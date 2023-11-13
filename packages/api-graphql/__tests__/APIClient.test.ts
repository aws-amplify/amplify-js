import {
	SchemaModel,
	ModelIntrospectionSchema,
} from '@aws-amplify/core/internals/utils';
import {
	normalizeMutationInput,
	flattenItems,
	generateSelectionSet,
	customSelectionSetToIR,
} from '../src/internals/APIClient';

import config from './fixtures/modeled/amplifyconfiguration';
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
			const selSet = customSelectionSetToIR(modelIntroSchema.models, 'Todo', [
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
			const selSet = customSelectionSetToIR(modelIntroSchema.models, 'Todo', [
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

		test('specific fields on the model; all fields on related model', () => {
			const selSet = customSelectionSetToIR(modelIntroSchema.models, 'Todo', [
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
			const selSet = customSelectionSetToIR(modelIntroSchema.models, 'Todo', [
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
			const selSet = customSelectionSetToIR(modelIntroSchema.models, 'Todo', [
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
	});

	describe('generateSelectionSet', () => {
		test('it should generate default selection set', () => {
			const selSet = generateSelectionSet(modelIntroSchema.models, 'Todo');

			const expected =
				'id name description createdAt updatedAt todoMetaId owner';

			expect(selSet).toEqual(expected);
		});

		test('it should generate custom selection set - top-level fields', () => {
			const selSet = generateSelectionSet(modelIntroSchema.models, 'Todo', [
				'id',
				'name',
			]);

			const expected = 'id name';

			expect(selSet).toEqual(expected);
		});

		test('it should generate custom selection set - specific nested fields', () => {
			const selSet = generateSelectionSet(modelIntroSchema.models, 'Todo', [
				'id',
				'name',
				'notes.id',
				'notes.createdAt',
			]);

			const expected = 'id name notes { items { id createdAt } }';

			expect(selSet).toEqual(expected);
		});

		test('it should generate custom selection set - all nested fields', () => {
			const selSet = generateSelectionSet(modelIntroSchema.models, 'Todo', [
				'id',
				'name',
				'notes.*',
			]);

			const expected =
				'id name notes { items { id body createdAt updatedAt todoNotesId owner } }';

			expect(selSet).toEqual(expected);
		});

		test('deeply nested on a bi-directional model', () => {
			const selSet = generateSelectionSet(modelIntroSchema.models, 'Todo', [
				'id',
				'name',
				'notes.todo.notes.todo.notes.todo.notes.*',
			]);

			const expected =
				'id name notes { items { todo { notes { items { todo { notes { items { todo { notes { items { id body createdAt updatedAt todoNotesId owner } } } } } } } } } } }';

			expect(selSet).toEqual(expected);
		});
	});
});
