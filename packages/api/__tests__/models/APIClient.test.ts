import { normalizeMutationInput, initializeModel } from '../../src/APIClient';
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
