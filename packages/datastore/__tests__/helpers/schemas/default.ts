import { ModelInit, Schema, __modelMeta__ } from '../../../src/types';
import {
	AsyncCollection,
	MutableModel,
	CompositeIdentifier,
	CustomIdentifier,
	ManagedIdentifier,
	OptionallyManagedIdentifier,
	AsyncItem,
} from '../../../src';

export declare class Model {
	public readonly id: string;
	public readonly field1: string;
	public readonly optionalField1?: string | null;
	public readonly dateCreated: string;
	public readonly emails?: string[] | null;
	public readonly ips?: (string | null)[] | null;
	public readonly metadata?: Metadata | null;
	public readonly logins?: Login[] | null;
	public readonly createdAt?: string | null;
	public readonly updatedAt?: string | null;

	constructor(init: ModelInit<Model>);

	static copyOf(
		src: Model,
		mutator: (draft: MutableModel<Model>) => void | Model,
	): Model;
}

export declare class Metadata {
	readonly author: string;
	readonly tags?: string[];
	readonly rewards: string[];
	readonly penNames: string[];
	readonly nominations?: string[];
	readonly misc?: (string | null)[];
	readonly login?: Login;
	constructor(init: Metadata);
}

export declare class Login {
	readonly username: string;
	constructor(init: Login);
}

export declare class Blog {
	public readonly id: string;
	public readonly title: string;
	public readonly posts: AsyncCollection<Post>;

	constructor(init: ModelInit<Blog>);

	static copyOf(
		src: Blog,
		mutator: (draft: MutableModel<Blog>) => void | Blog,
	): Blog;
}

export declare class Post {
	public readonly id: string;
	public readonly title: string;
	public readonly comments: AsyncCollection<Comment>;
	public readonly blogId?: string;
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<Post>);

	static copyOf(
		src: Post,
		mutator: (draft: MutableModel<Post>) => void | Post,
	): Post;
}

export declare class Comment {
	public readonly id: string;
	public readonly content: string;
	public readonly post: Promise<Post>;
	public readonly postId?: string;

	constructor(init: ModelInit<Comment>);

	static copyOf(
		src: Comment,
		mutator: (draft: MutableModel<Comment>) => void | Comment,
	): Comment;
}
export declare class PostUni {
	public readonly id: string;
	public readonly title: string;
	public readonly comments: AsyncCollection<Comment>;
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<Post>);

	static copyOf(
		src: Post,
		mutator: (draft: MutableModel<Post>) => void | Post,
	): Post;
}

export declare class CommentUni {
	public readonly id: string;
	public readonly content: string;
	public readonly postID: string;

	constructor(init: ModelInit<Comment>);

	static copyOf(
		src: Comment,
		mutator: (draft: MutableModel<Comment>) => void | Comment,
	): Comment;
}

export declare class User {
	public readonly id: string;
	public readonly name: string;
	public readonly profile: Promise<Profile | undefined>;
	public readonly profileID?: string;

	constructor(init: ModelInit<User>);

	static copyOf(
		src: User,
		mutator: (draft: MutableModel<User>) => void | User,
	): User;
}
export declare class Profile {
	public readonly id: string;
	public readonly firstName: string;
	public readonly lastName: string;

	constructor(init: ModelInit<Profile>);

	static copyOf(
		src: Profile,
		mutator: (draft: MutableModel<Profile>) => void | Profile,
	): Profile;
}

export declare class PostComposite {
	public readonly id: string;
	public readonly title: string;
	public readonly description: string;
	public readonly created: string;
	public readonly sort: number;

	constructor(init: ModelInit<PostComposite>);

	static copyOf(
		src: PostComposite,
		mutator: (draft: MutableModel<PostComposite>) => void | PostComposite,
	): PostComposite;
}

export declare class PostCustomPK {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<PostCustomPK, 'postId'>;
	};
	public readonly postId: string;
	public readonly title: string;
	public readonly description?: string;
	public readonly dateCreated: string;
	public readonly optionalField1?: string;
	public readonly emails?: string[];
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<PostCustomPK>);

	static copyOf(
		src: PostCustomPK,
		mutator: (draft: MutableModel<PostCustomPK>) => void | PostCustomPK,
	): PostCustomPK;
}

export declare class PostCustomPKSort {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<PostCustomPKSort, ['id', 'postId']>;
	};
	public readonly id: number | string;
	public readonly postId: string;
	public readonly title: string;
	public readonly description?: string;

	constructor(init: ModelInit<PostCustomPKSort>);

	static copyOf(
		src: PostCustomPKSort,
		mutator: (draft: MutableModel<PostCustomPKSort>) => void | PostCustomPKSort,
	): PostCustomPKSort;
}

export declare class PostCustomPKComposite {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<PostCustomPKComposite, ['id', 'postId']>;
	};
	public readonly id: string;
	public readonly postId: string;
	public readonly title: string;
	public readonly description?: string;
	public readonly sort: number;

	constructor(init: ModelInit<PostCustomPKComposite>);

	static copyOf(
		src: PostCustomPKComposite,
		mutator: (
			draft: MutableModel<PostCustomPKComposite>,
		) => void | PostCustomPKComposite,
	): PostCustomPKComposite;
}

export declare class BasicModel {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<BasicModel, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly body: string;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<BasicModel>);
	static copyOf(
		source: BasicModel,
		mutator: (
			draft: MutableModel<BasicModel>,
		) => MutableModel<BasicModel> | void,
	): BasicModel;
}

export declare class BasicModelWritableTS {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<BasicModelWritableTS, 'id'>;
		readOnlyFields: never;
	};
	readonly id: string;
	readonly body: string;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<BasicModelWritableTS>);
	static copyOf(
		source: BasicModelWritableTS,
		mutator: (
			draft: MutableModel<BasicModelWritableTS>,
		) => MutableModel<BasicModelWritableTS> | void,
	): BasicModelWritableTS;
}

export declare class BasicModelRequiredTS {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<BasicModelRequiredTS, 'id'>;
		readOnlyFields: never;
	};
	readonly id: string;
	readonly body: string;
	readonly createdAt: string;
	readonly updatedOn?: string | null;
	constructor(init: ModelInit<BasicModelRequiredTS>);
	static copyOf(
		source: BasicModelRequiredTS,
		mutator: (
			draft: MutableModel<BasicModelRequiredTS>,
		) => MutableModel<BasicModelRequiredTS> | void,
	): BasicModelRequiredTS;
}

export declare class HasOneParent {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<HasOneParent, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly child: Promise<HasOneChild | undefined>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly hasOneParentChildId?: string | null;
	constructor(init: ModelInit<HasOneParent>);
	static copyOf(
		source: HasOneParent,
		mutator: (
			draft: MutableModel<HasOneParent>,
		) => MutableModel<HasOneParent> | void,
	): HasOneParent;
}

export declare class HasOneChild {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<HasOneChild, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<HasOneChild>);
	static copyOf(
		source: HasOneChild,
		mutator: (
			draft: MutableModel<HasOneChild>,
		) => MutableModel<HasOneChild> | void,
	): HasOneChild;
}

export declare class MtmLeft {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<MtmLeft, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly rightOnes: AsyncCollection<MtmJoin>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;

	constructor(init: ModelInit<MtmLeft>);
	static copyOf(
		source: MtmLeft,
		mutator: (draft: MutableModel<MtmLeft>) => MutableModel<MtmLeft> | void,
	): MtmLeft;
}

export declare class MtmRight {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<MtmRight, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly leftOnes: AsyncCollection<MtmJoin>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;

	constructor(init: ModelInit<MtmRight>);
	static copyOf(
		source: MtmRight,
		mutator: (draft: MutableModel<MtmRight>) => MutableModel<MtmRight> | void,
	): MtmRight;
}

export declare class MtmJoin {
	readonly [__modelMeta__]: {
		identifier: ManagedIdentifier<MtmJoin, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly mtmLeftId?: string | null;
	readonly mtmRightId?: string | null;
	readonly mtmLeft: AsyncItem<MtmLeft>;
	readonly mtmRight: AsyncItem<MtmRight>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;

	constructor(init: ModelInit<MtmJoin>);
	static copyOf(
		source: MtmJoin,
		mutator: (draft: MutableModel<MtmJoin>) => MutableModel<MtmJoin> | void,
	): MtmJoin;
}

export declare class DefaultPKParent {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<DefaultPKParent, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly children: AsyncCollection<DefaultPKChild>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<DefaultPKParent>);
	static copyOf(
		source: DefaultPKParent,
		mutator: (
			draft: MutableModel<DefaultPKParent>,
		) => MutableModel<DefaultPKParent> | void,
	): DefaultPKParent;
}

export declare class DefaultPKChild {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<DefaultPKChild, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly content?: string | null;
	readonly parent: Promise<DefaultPKParent | undefined>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly defaultPKParentChildrenId?: string | null;
	constructor(init: ModelInit<DefaultPKChild>);
	static copyOf(
		source: DefaultPKChild,
		mutator: (
			draft: MutableModel<DefaultPKChild>,
		) => MutableModel<DefaultPKChild> | void,
	): DefaultPKChild;
}

export declare class DefaultPKHasOneParent {
	readonly id: string;
	readonly content?: string | null;
	readonly child?: Promise<DefaultPKHasOneChild>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<DefaultPKParent>);
	static copyOf(
		source: DefaultPKHasOneParent,
		mutator: (
			draft: MutableModel<DefaultPKHasOneParent>,
		) => MutableModel<DefaultPKHasOneParent> | void,
	): DefaultPKHasOneParent;
}

export declare class DefaultPKHasOneChild {
	readonly id: string;
	readonly content?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly defaultPKHasOneParentChildrenId?: string | null;
	constructor(init: ModelInit<DefaultPKHasOneChild>);
	static copyOf(
		source: DefaultPKHasOneChild,
		mutator: (
			draft: MutableModel<DefaultPKHasOneChild>,
		) => MutableModel<DefaultPKHasOneChild> | void,
	): DefaultPKHasOneChild;
}

/**
 * This is it.
 */
export declare class CompositePKParent {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositePKParent, ['customId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly customId: string;
	readonly content: string;
	readonly children: AsyncCollection<CompositePKChild>;
	readonly implicitChildren: AsyncCollection<ImplicitChild>;
	readonly strangeChildren: AsyncCollection<StrangeExplicitChild>;
	readonly childrenSansBelongsTo: AsyncCollection<ChildSansBelongsTo>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<CompositePKParent>);
	static copyOf(
		source: CompositePKParent,
		mutator: (
			draft: MutableModel<CompositePKParent>,
		) => MutableModel<CompositePKParent> | void,
	): CompositePKParent;
}

export declare class CompositePKChild {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositePKChild, ['childId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly childId: string;
	readonly content: string;
	readonly parent: Promise<CompositePKParent | undefined>;
	readonly parentId?: string | null;
	readonly parentTitle?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<CompositePKChild>);
	static copyOf(
		source: CompositePKChild,
		mutator: (
			draft: MutableModel<CompositePKChild>,
		) => MutableModel<CompositePKChild> | void,
	): CompositePKChild;
}

export declare class ImplicitChild {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<ImplicitChild, ['childId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly childId: string;
	readonly content: string;
	readonly parent: Promise<CompositePKParent>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	readonly compositePKParentImplicitChildrenCustomId?: string | null;
	readonly compositePKParentImplicitChildrenContent?: string | null;
	constructor(init: ModelInit<ImplicitChild>);
	static copyOf(
		source: ImplicitChild,
		mutator: (
			draft: MutableModel<ImplicitChild>,
		) => MutableModel<ImplicitChild> | void,
	): ImplicitChild;
}

export declare class StrangeExplicitChild {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<
			StrangeExplicitChild,
			['strangeId', 'content']
		>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly strangeId: string;
	readonly content: string;
	readonly parent: Promise<CompositePKParent>;
	readonly strangeParentId?: string | null;
	readonly strangeParentTitle?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<StrangeExplicitChild>);
	static copyOf(
		source: StrangeExplicitChild,
		mutator: (
			draft: MutableModel<StrangeExplicitChild>,
		) => MutableModel<StrangeExplicitChild> | void,
	): StrangeExplicitChild;
}

export declare class ChildSansBelongsTo {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<ChildSansBelongsTo, ['childId', 'content']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly childId: string;
	readonly content: string;
	readonly compositePKParentChildrenSansBelongsToCustomId: string;
	readonly compositePKParentChildrenSansBelongsToContent?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<ChildSansBelongsTo>);
	static copyOf(
		source: ChildSansBelongsTo,
		mutator: (
			draft: MutableModel<ChildSansBelongsTo>,
		) => MutableModel<ChildSansBelongsTo> | void,
	): ChildSansBelongsTo;
}

type LegacyJSONBlogMetaData = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

type LegacyJSONPostMetaData = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

type LegacyJSONCommentMetaData = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

export declare class LegacyJSONBlog {
	readonly id: string;
	readonly name?: string | null;
	readonly posts?: AsyncCollection<LegacyJSONPost>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<LegacyJSONBlog, LegacyJSONBlogMetaData>);
	static copyOf(
		source: LegacyJSONBlog,
		mutator: (
			draft: MutableModel<LegacyJSONBlog, LegacyJSONBlogMetaData>,
		) => MutableModel<LegacyJSONBlog, LegacyJSONBlogMetaData> | void,
	): LegacyJSONBlog;
}

export declare class LegacyJSONPost {
	readonly id: string;
	readonly title: string;
	readonly blog?: Promise<LegacyJSONBlog | undefined>;
	readonly comments?: AsyncCollection<LegacyJSONComment>;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<LegacyJSONPost, LegacyJSONPostMetaData>);
	static copyOf(
		source: LegacyJSONPost,
		mutator: (
			draft: MutableModel<LegacyJSONPost, LegacyJSONPostMetaData>,
		) => MutableModel<LegacyJSONPost, LegacyJSONPostMetaData> | void,
	): LegacyJSONPost;
}

export declare class LegacyJSONComment {
	readonly id: string;
	readonly post?: Promise<LegacyJSONPost | undefined>;
	readonly content: string;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<LegacyJSONComment, LegacyJSONCommentMetaData>);
	static copyOf(
		source: LegacyJSONComment,
		mutator: (
			draft: MutableModel<LegacyJSONComment, LegacyJSONCommentMetaData>,
		) => MutableModel<LegacyJSONComment, LegacyJSONCommentMetaData> | void,
	): LegacyJSONComment;
}

export declare class ModelWithBoolean {
	public readonly id: string;
	public readonly boolField?: boolean;
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<ModelWithBoolean>);

	static copyOf(
		src: ModelWithBoolean,
		mutator: (draft: MutableModel<ModelWithBoolean>) => void | ModelWithBoolean,
	): ModelWithBoolean;
}

export declare class ModelWithExplicitOwner {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<ModelWithExplicitOwner, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly title: string;
	readonly owner?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<ModelWithExplicitOwner>);
	static copyOf(
		source: ModelWithExplicitOwner,
		mutator: (
			draft: MutableModel<ModelWithExplicitOwner>,
		) => MutableModel<ModelWithExplicitOwner> | void,
	): ModelWithExplicitOwner;
}

export declare class ModelWithExplicitCustomOwner {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<ModelWithExplicitCustomOwner, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly title: string;
	readonly customowner?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<ModelWithExplicitCustomOwner>);
	static copyOf(
		source: ModelWithExplicitCustomOwner,
		mutator: (
			draft: MutableModel<ModelWithExplicitCustomOwner>,
		) => MutableModel<ModelWithExplicitCustomOwner> | void,
	): ModelWithExplicitCustomOwner;
}

export declare class ModelWithMultipleCustomOwner {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<ModelWithMultipleCustomOwner, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly title: string;
	readonly customownerOne?: string | null;
	readonly customownerTwo?: string | null;
	readonly createdAt?: string | null;
	readonly updatedAt?: string | null;
	constructor(init: ModelInit<ModelWithMultipleCustomOwner>);
	static copyOf(
		source: ModelWithMultipleCustomOwner,
		mutator: (
			draft: MutableModel<ModelWithMultipleCustomOwner>,
		) => MutableModel<ModelWithMultipleCustomOwner> | void,
	): ModelWithMultipleCustomOwner;
}

export declare class ModelWithIndexes {
	public readonly id: string;
	public readonly stringField?: string;
	public readonly intField?: number;
	public readonly floatField?: number;
	public readonly createdAt?: string;
	public readonly updatedAt?: string;

	constructor(init: ModelInit<ModelWithIndexes>);

	static copyOf(
		src: ModelWithIndexes,
		mutator: (draft: MutableModel<ModelWithIndexes>) => void | ModelWithIndexes,
	): ModelWithIndexes;
}

export function testSchema(): Schema {
	return {
		enums: {},
		models: {
			Model: {
				name: 'Model',
				pluralName: 'Models',
				syncable: true,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
					optionalField1: {
						name: 'optionalField1',
						isArray: false,
						type: 'String',
						isRequired: false,
					},
					dateCreated: {
						name: 'dateCreated',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					emails: {
						name: 'emails',
						isArray: true,
						type: 'AWSEmail',
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
					},
					ips: {
						name: 'ips',
						isArray: true,
						type: 'AWSIPAddress',
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
					},
					metadata: {
						name: 'metadata',
						isArray: false,
						type: {
							nonModel: 'Metadata',
						},
						isRequired: false,
						attributes: [],
					},
					logins: {
						name: 'logins',
						isArray: true,
						type: {
							nonModel: 'Login',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
			},
			ModelWithBoolean: {
				name: 'ModelWithBoolean',
				pluralName: 'ModelWithBooleans',
				syncable: true,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					boolField: {
						name: 'boolField',
						isArray: false,
						type: 'Boolean',
						isRequired: false,
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
			},
			Blog: {
				name: 'Blog',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					posts: {
						name: 'posts',
						isArray: true,
						type: {
							model: 'Post',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['blogId'],
						},
					},
				},
				syncable: true,
				pluralName: 'Blogs',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			Post: {
				name: 'Post',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					blogId: {
						name: 'blogId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					comments: {
						name: 'comments',
						isArray: true,
						type: {
							model: 'Comment',
						},
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['post'],
						},
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Posts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'byBlog',
							fields: ['blogId'],
						},
					},
				],
			},
			Comment: {
				name: 'Comment',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postId: {
						name: 'postId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					post: {
						name: 'post',
						isArray: false,
						type: {
							model: 'Post',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['postId'],
						},
					},
				},
				syncable: true,
				pluralName: 'Comments',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'byPost',
							fields: ['postId'],
						},
					},
				],
			},
			PostUni: {
				name: 'PostUni',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					comments: {
						name: 'comments',
						isArray: true,
						type: {
							model: 'CommentUni',
						},
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['postID'],
						},
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Posts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			CommentUni: {
				name: 'CommentUni',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postID: {
						name: 'postID',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Comments',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'byPost',
							fields: ['postID', 'content'],
						},
					},
				],
			},
			LocalModel: {
				name: 'LocalModel',
				pluralName: 'LocalModels',
				syncable: false,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
			User: {
				name: 'User',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					name: {
						name: 'name',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					profileID: {
						name: 'profileID',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					profile: {
						name: 'profile',
						isArray: false,
						type: {
							model: 'Profile',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['profileID'],
						},
					},
				},
				syncable: true,
				pluralName: 'Users',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			Profile: {
				name: 'Profile',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					firstName: {
						name: 'firstName',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					lastName: {
						name: 'lastName',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Profiles',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			PostComposite: {
				name: 'PostComposite',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					created: {
						name: 'created',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					sort: {
						name: 'sort',
						isArray: false,
						type: 'Int',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostComposites',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'titleCreatedSort',
							fields: ['title', 'created', 'sort'],
						},
					},
				],
			},
			PostCustomPK: {
				name: 'PostCustomPK',
				fields: {
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					emails: {
						name: 'emails',
						isArray: true,
						type: 'AWSEmail',
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					dateCreated: {
						name: 'dateCreated',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostCustomPKS',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['postId'],
						},
					},
				],
			},
			PostCustomPKSort: {
				name: 'PostCustomPKSort',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostCustomPKSorts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id', 'postId'],
						},
					},
				],
			},
			PostCustomPKComposite: {
				name: 'PostCustomPKComposite',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					sort: {
						name: 'sort',
						isArray: false,
						type: 'Int',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'PostCustomPKComposites',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id', 'postId', 'sort'],
						},
					},
				],
			},

			BasicModel: {
				name: 'BasicModel',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					body: {
						name: 'body',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'BasicModels',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			BasicModelWritableTS: {
				name: 'BasicModelWritableTS',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					body: {
						name: 'body',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: false,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: false,
					},
				},
				syncable: true,
				pluralName: 'BasicModelWritableTimestampss',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			/**
			 * timestamps: {
			 * 	updatedAt: "updatedOn"
			 * }
			 */
			BasicModelRequiredTS: {
				name: 'BasicModelRequiredTS',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					body: {
						name: 'body',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true, // `AWSDateTime!` (intentionally required)
						attributes: [],
					},
					updatedOn: {
						name: 'updatedOn', //
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false, // `AWSDateTime` (intentionally optional)
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'BasicModelRequiredTS',
				attributes: [
					{
						type: 'model',
						properties: {
							timestamps: {
								updatedAt: 'updatedOn',
							},
						},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									provider: 'userPools',
									ownerField: 'owner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
			},
			HasOneParent: {
				name: 'HasOneParent',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					child: {
						name: 'child',
						isArray: false,
						type: {
							model: 'HasOneChild',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['hasOneParentChildId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					hasOneParentChildId: {
						name: 'hasOneParentChildId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'HasOneParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			HasOneChild: {
				name: 'HasOneChild',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'HasOneChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			MtmLeft: {
				name: 'MtmLeft',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					rightOnes: {
						name: 'rightOnes',
						isArray: true,
						type: {
							model: 'MtmJoin',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: 'mtmLeft',
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'MtmLefts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			MtmRight: {
				name: 'MtmRight',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					leftOnes: {
						name: 'leftOnes',
						isArray: true,
						type: {
							model: 'MtmJoin',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: 'mtmRight',
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'MtmRights',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			MtmJoin: {
				name: 'MtmJoin',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					mtmLeftId: {
						name: 'mtmLeftId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					mtmRightId: {
						name: 'mtmRightId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					mtmLeft: {
						name: 'mtmLeft',
						isArray: false,
						type: {
							model: 'MtmLeft',
						},
						isRequired: true,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetName: 'mtmLeftId',
						},
					},
					mtmRight: {
						name: 'mtmRight',
						isArray: false,
						type: {
							model: 'MtmRight',
						},
						isRequired: true,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetName: 'mtmRightId',
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'MtmJoins',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'byMtmLeft',
							fields: ['mtmLeftId'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byMtmRight',
							fields: ['mtmRightId'],
						},
					},
				],
			},
			DefaultPKParent: {
				name: 'DefaultPKParent',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					children: {
						name: 'children',
						isArray: true,
						type: {
							model: 'DefaultPKChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['defaultPKParentChildrenId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'DefaultPKParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			DefaultPKChild: {
				name: 'DefaultPKChild',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'DefaultPKParent',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['defaultPKParentChildrenId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					defaultPKParentChildrenId: {
						name: 'defaultPKParentChildrenId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'DefaultPKChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['id'],
						},
					},
				],
			},
			DefaultPKHasOneParent: {
				name: 'DefaultPKHasOneParent',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					child: {
						name: 'child',
						isArray: false,
						type: {
							model: 'DefaultPKHasOneChild',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: 'id',
							targetName: 'defaultPKHasOneParentChildId',
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					defaultPKHasOneParentChildId: {
						name: 'defaultPKHasOneParentChildId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'DefaultPKHasOneParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			DefaultPKHasOneChild: {
				name: 'DefaultPKHasOneChild',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'DefaultPKHasOneChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			CompositePKParent: {
				name: 'CompositePKParent',
				fields: {
					customId: {
						name: 'customId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					children: {
						name: 'children',
						isArray: true,
						type: {
							model: 'CompositePKChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['parent'],
						},
					},
					implicitChildren: {
						name: 'implicitChildren',
						isArray: true,
						type: {
							model: 'ImplicitChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: [
								'compositePKParentImplicitChildrenCustomId',
								'compositePKParentImplicitChildrenContent',
							],
						},
					},
					strangeChildren: {
						name: 'strangeChildren',
						isArray: true,
						type: {
							model: 'StrangeExplicitChild',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['parent'],
						},
					},
					childrenSansBelongsTo: {
						name: 'childrenSansBelongsTo',
						isArray: true,
						type: {
							model: 'ChildSansBelongsTo',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: [
								'compositePKParentChildrenSansBelongsToCustomId',
								'compositePKParentChildrenSansBelongsToContent',
							],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'CompositePKParents',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['customId', 'content'],
						},
					},
				],
			},
			CompositePKChild: {
				name: 'CompositePKChild',
				fields: {
					childId: {
						name: 'childId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'CompositePKParent',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['parentId', 'parentTitle'],
						},
					},
					parentId: {
						name: 'parentId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					parentTitle: {
						name: 'parentTitle',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'CompositePKChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['childId', 'content'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byParent',
							fields: ['parentId', 'parentTitle'],
						},
					},
				],
			},
			ImplicitChild: {
				name: 'ImplicitChild',
				fields: {
					childId: {
						name: 'childId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'CompositePKParent',
						},
						isRequired: true,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: [
								'compositePKParentImplicitChildrenCustomId',
								'compositePKParentImplicitChildrenContent',
							],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					compositePKParentImplicitChildrenCustomId: {
						name: 'compositePKParentImplicitChildrenCustomId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					compositePKParentImplicitChildrenContent: {
						name: 'compositePKParentImplicitChildrenContent',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'ImplicitChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['childId', 'content'],
						},
					},
				],
			},
			StrangeExplicitChild: {
				name: 'StrangeExplicitChild',
				fields: {
					strangeId: {
						name: 'strangeId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					parent: {
						name: 'parent',
						isArray: false,
						type: {
							model: 'CompositePKParent',
						},
						isRequired: true,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['strangeParentId', 'strangeParentTitle'],
						},
					},
					strangeParentId: {
						name: 'strangeParentId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					strangeParentTitle: {
						name: 'strangeParentTitle',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'StrangeExplicitChildren',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['strangeId', 'content'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byCompositePKParentX',
							fields: ['strangeParentId', 'strangeParentTitle'],
						},
					},
				],
			},
			ChildSansBelongsTo: {
				name: 'ChildSansBelongsTo',
				fields: {
					childId: {
						name: 'childId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					compositePKParentChildrenSansBelongsToCustomId: {
						name: 'compositePKParentChildrenSansBelongsToCustomId',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					compositePKParentChildrenSansBelongsToContent: {
						name: 'compositePKParentChildrenSansBelongsToContent',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'ChildSansBelongsTos',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['childId', 'content'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byParent',
							fields: [
								'compositePKParentChildrenSansBelongsToCustomId',
								'compositePKParentChildrenSansBelongsToContent',
							],
						},
					},
				],
			},
			LegacyJSONBlog: {
				name: 'LegacyJSONBlog',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					name: {
						name: 'name',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					posts: {
						name: 'posts',
						isArray: true,
						type: {
							model: 'LegacyJSONPost',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: 'legacyJSONBlogPostsId',
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'LegacyJSONBlogs',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			LegacyJSONPost: {
				name: 'LegacyJSONPost',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					blog: {
						name: 'blog',
						isArray: false,
						type: {
							model: 'LegacyJSONBlog',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetName: 'legacyJSONBlogPostsId',
						},
					},
					comments: {
						name: 'comments',
						isArray: true,
						type: {
							model: 'LegacyJSONComment',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: 'legacyJSONPostCommentsId',
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'LegacyJSONPosts',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			LegacyJSONComment: {
				name: 'LegacyJSONComment',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					post: {
						name: 'post',
						isArray: false,
						type: {
							model: 'LegacyJSONPost',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetName: 'legacyJSONPostCommentsId',
						},
					},
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'LegacyJSONComments',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
				],
			},
			ModelWithExplicitOwner: {
				name: 'ModelWithExplicitOwner',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					owner: {
						name: 'owner',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'ModelWithExplicitOwners',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									provider: 'userPools',
									ownerField: 'owner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
			},
			ModelWithExplicitCustomOwner: {
				name: 'ModelWithExplicitCustomOwner',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					customowner: {
						name: 'customowner',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'ModelWithExplicitCustomOwners',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									provider: 'userPools',
									ownerField: 'customowner',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
							],
						},
					},
				],
			},
			ModelWithMultipleCustomOwner: {
				name: 'ModelWithMultipleCustomOwner',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					title: {
						name: 'title',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					customownerOne: {
						name: 'customownerOne',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					customownerTwo: {
						name: 'customownerTwo',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'ModelWithMultipleCustomOwners',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									provider: 'userPools',
									ownerField: 'customownerOne',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'update', 'delete', 'read'],
								},
								{
									provider: 'userPools',
									ownerField: 'customownerTwo',
									allow: 'owner',
									identityClaim: 'cognito:username',
									operations: ['create', 'read'],
								},
							],
						},
					},
				],
			},
			ModelWithIndexes: {
				name: 'ModelWithIndexes',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					stringField: {
						name: 'stringField',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					floatField: {
						name: 'floatField',
						isArray: false,
						type: 'Float',
						isRequired: false,
						attributes: [],
					},
					intField: {
						name: 'intField',
						isArray: false,
						type: 'Int',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: false,
						attributes: [],
						isReadOnly: true,
					},
				},
				syncable: true,
				pluralName: 'ModelWithIndexess',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							name: 'byStringField',
							fields: ['stringField'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byIntField',
							fields: ['intField'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'byFloatField',
							fields: ['floatField'],
						},
					},
				],
			},
		},
		nonModels: {
			Metadata: {
				name: 'Metadata',
				fields: {
					author: {
						name: 'author',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					tags: {
						name: 'tags',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
					rewards: {
						name: 'rewards',
						isArray: true,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					penNames: {
						name: 'penNames',
						isArray: true,
						type: 'String',
						isRequired: true,
						isArrayNullable: true,
						attributes: [],
					},
					nominations: {
						name: 'nominations',
						isArray: true,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					misc: {
						name: 'misc',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
					login: {
						name: 'login',
						isArray: false,
						type: {
							nonModel: 'Login',
						},
						isRequired: false,
						attributes: [],
					},
				},
			},
			Login: {
				name: 'Login',
				fields: {
					username: {
						name: 'username',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
				},
			},
		},
		version: '1',
		codegenVersion: '3.2.0',
	};
}
