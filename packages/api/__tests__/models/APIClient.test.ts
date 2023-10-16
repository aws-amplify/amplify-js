import { normalizeMutationInput, flattenItems } from '../../src/APIClient';
import modelIntroSchema from '../assets/model-introspection';

describe('APIClient', () => {
	// 1. make this its own describe block
	// 2. test all relationship combinations
	test('normalizeMutationInput', () => {
		const post = {
			postId: 'postId123',
			title: 'My Post',
		};

		const tag = {
			id: 'tag1',
			name: 'News',
		};

		const postTag = {
			post: post,
			tag: tag,
		};

		const expectedInput = {
			postPostId: post.postId,
			posttitle: post.title,
			tagId: tag.id,
		};

		const postTagDef = modelIntroSchema.models.PostTags;

		const normalized = normalizeMutationInput(
			postTag,
			postTagDef,
			modelIntroSchema
		);

		expect(normalized).toEqual(expectedInput);
	});

	test('initializeModel', () => {});
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
});
