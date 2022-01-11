// @ts-nocheck
/**
 * Once we move to TypeScript 3.9 or above, above's line should be removed.
 * For now this whole file is ignored
 */

import {
	CustomIdentifier,
	ManagedIdentifier,
	ModelInit,
	MutableModel,
	OptionallyManagedIdentifier,
} from '../src';

/**
 * Returns a dummy class. This file doesn't test runtime behavior, only typings
 *
 * @param clazz
 * @returns
 */
function createDummyModelInstance<T>(clazz: T): T {
	const r = new Proxy(
		class {
			constructor() {}
			static copyOf() {}
		},
		{}
	);

	return r as unknown as T;
}

describe('ManagedId', () => {
	type PostManagedIdMetaData = {
		identifier: ManagedIdentifier;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	const PostManagedId = createDummyModelInstance(
		class PostManagedId {
			readonly id: string;
			readonly title: string;
			readonly createdAt?: string;
			readonly updatedAt?: string;
			constructor(init: ModelInit<PostManagedId, PostManagedIdMetaData>) {}
			static copyOf(
				source: PostManagedId,
				mutator: (
					draft: MutableModel<PostManagedId, PostManagedIdMetaData>
				) => MutableModel<PostManagedId, PostManagedIdMetaData> | void
			): PostManagedId {
				return new PostManagedId({} as any);
			}
		}
	);

	test('id is not accepted in constructor', () => {
		new PostManagedId({
			// @ts-expect-error
			id: 'sadasd',
			title: 'aaaaaaa',
		});
	});

	test('unrecognized field is not accepted in constructor', () => {
		new PostManagedId({
			// @ts-expect-error
			tenantId: 'tenantABC',
			title: 'aaaaaaa',
		});
	});

	test('Missing required field throws compilation error ', () => {
		// @ts-expect-error
		new PostManagedId({});
	});

	test('copyOf - id is present and readonly', () => {
		PostManagedId.copyOf(
			new PostManagedId({
				title: 'asdasdasd',
			}),
			d => {
				d.id;
				// @ts-expect-error
				d.id = 'dddd'; // This should fail with a compiler error
			}
		);
	});
});

describe('OptionalId', () => {
	type PostOptionalIdMetaData = {
		identifier: OptionallyManagedIdentifier;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	const PostOptionalId = createDummyModelInstance(
		class PostOptionalId {
			readonly id: string;
			readonly title: string;
			readonly createdAt?: string;
			readonly updatedAt?: string;
			constructor(init: ModelInit<PostOptionalId, PostOptionalIdMetaData>) {}
			static copyOf(
				source: PostOptionalId,
				mutator: (
					draft: MutableModel<PostOptionalId, PostOptionalIdMetaData>
				) => MutableModel<PostOptionalId, PostOptionalIdMetaData> | void
			): PostOptionalId {
				return undefined;
			}
		}
	);

	test('id is not required in constructor', () => {
		new PostOptionalId({
			title: 'asdasdasd',
		});
	});

	test('id is accepted in constructor', () => {
		new PostOptionalId({
			id: 'sadasd',
			title: 'asdasdasd',
		});
	});

	test('unrecognized field is not accepted in constructor', () => {
		new PostOptionalId({
			title: 'asdasdasd',
			//@ts-expect-error
			something: 'something',
		});
	});

	test('Missing required field throws compilation error ', () => {
		// @ts-expect-error
		new PostOptionalId({});
	});

	test('copyOf - id is present and readonly', () => {
		PostOptionalId.copyOf(new PostOptionalId({ title: '' }), d => {
			d.id;
			// @ts-expect-error
			d.id = 'sdsdsdsds';
			d.title = 'ffffff';
		});
	});
});

describe('CustomId - multi field', () => {
	type PostCustomIdMetaData = {
		identifier: CustomIdentifier<'tenantId' | 'postId'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	const PostCustomId = createDummyModelInstance(
		class PostCustomId {
			readonly tenantId: string;
			readonly postId: string;
			readonly title: string;
			readonly createdAt?: string;
			readonly updatedAt?: string;
			constructor(init: ModelInit<PostCustomId, PostCustomIdMetaData>) {}
			static copyOf(
				source: PostCustomId,
				mutator: (
					draft: MutableModel<PostCustomId, PostCustomIdMetaData>
				) => MutableModel<PostCustomId, PostCustomIdMetaData> | void
			): PostCustomId {
				return undefined;
			}
		}
	);

	test('id is not accepted in constructor', () => {
		new PostCustomId({
			tenantId: 'aaaaaaa',
			postId: 'ssssss',
			title: 'sssss',
			// @ts-expect-error
			id: 'ggggg',
		});
	});

	test('unrecognized field is not accepted in constructor', () => {
		new PostCustomId({
			title: 'asdasdasd',
			tenantId: 'sssssss',
			postId: 'eeeeee',
			// @ts-expect-error
			something: 'something',
		});
	});

	test('Missing required field throws compilation error ', () => {
		// @ts-expect-error
		new PostCustomId({});
	});

	test('copyOf - id is not present', () => {
		PostCustomId.copyOf(
			new PostCustomId({ tenantId: 'a', postId: 'b', title: '' }),
			d => {
				// @ts-expect-error
				d.id;
			}
		);
	});

	test('copyOf - PK fields are present and readonly', () => {
		PostCustomId.copyOf(
			new PostCustomId({ tenantId: 'a', postId: 'b', title: '' }),
			d => {
				d.tenantId;
				d.postId;
				//@ts-expect-error
				d.tenantId = 'aaaa';
				//@ts-expect-error
				d.postId = 'bbbb';
			}
		);
	});
});

describe('CustomId - single renamed', () => {
	type PostCustomIdRenamedMetaData = {
		identifier: CustomIdentifier<'myId'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	const PostCustomIdRenamed = createDummyModelInstance(
		class PostCustomIdRenamed {
			readonly myId: string;
			readonly title: string;
			readonly createdAt?: string;
			readonly updatedAt?: string;
			constructor(
				init: ModelInit<PostCustomIdRenamed, PostCustomIdRenamedMetaData>
			) {}
			static copyOf(
				source: PostCustomIdRenamed,
				mutator: (
					draft: MutableModel<PostCustomIdRenamed, PostCustomIdRenamedMetaData>
				) => MutableModel<
					PostCustomIdRenamed,
					PostCustomIdRenamedMetaData
				> | void
			): PostCustomIdRenamed {
				return undefined;
			}
		}
	);

	test('custom identifier is required in constructor', () => {
		new PostCustomIdRenamed({
			myId: 'aaaaaa',
			title: 'asdasdasd',
		});
	});

	test('unrecognized field is not accepted in constructor', () => {
		new PostCustomIdRenamed({
			myId: 'aaaaaa',
			title: 'asdasdasd',
			//@ts-expect-error
			something: 'something',
		});
	});

	test('Missing required field throws compilation error ', () => {
		// @ts-expect-error
		new PostCustomIdRenamed({});
	});

	test('copyOf - custom identifier is present and readonly', () => {
		PostCustomIdRenamed.copyOf(
			new PostCustomIdRenamed({ myId: 'wwwww', title: '' }),
			d => {
				d.myId;
				// @ts-expect-error
				d.myId = 'sdsdsdsds';
				d.title = 'ffffff';
			}
		);
	});
});

describe('BackwardsCompatible', () => {
	type PostNoIdMetaData = {
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	const PostNoId = createDummyModelInstance(
		class PostNoId {
			readonly id: string;
			readonly title: string;
			readonly createdAt?: string;
			readonly updatedAt?: string;
			constructor(init: ModelInit<PostNoId, PostNoIdMetaData>) {}
			static copyOf(
				source: PostNoId,
				mutator: (
					draft: MutableModel<PostNoId, PostNoIdMetaData>
				) => MutableModel<PostNoId, PostNoIdMetaData> | void
			): PostNoId {
				return undefined;
			}
		}
	);

	test('id is not accepted in constructor', () => {
		new PostNoId({
			// @ts-expect-error
			id: 'sadasd',
			title: 'aaaaaaa',
		});
	});

	test('unrecognized field is not accepted in constructor', () => {
		new PostNoId({
			// @ts-expect-error
			tenantId: 'tenantABC',
			title: 'aaaaaaa',
		});
	});

	test('Missing required field throws compilation error ', () => {
		// @ts-expect-error
		new PostNoId({});
	});

	test('copyOf - id is present and readonly', () => {
		PostNoId.copyOf(
			new PostNoId({
				title: 'asdasdasd',
			}),
			d => {
				d.id;
				// @ts-expect-error
				d.id = 'dddd'; // This should fail with a compiler error
			}
		);
	});
});
