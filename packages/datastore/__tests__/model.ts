import {
	initSchema,
	ModelInit,
	MutableModel,
	NonModelTypeConstructor,
	PersistentModelConstructor,
	AsyncCollection,
} from '../src/index';
import { newSchema } from './schema';

declare class BlogModel {
	readonly id: string;
	readonly name: string;
	readonly posts: AsyncCollection<PostModel>;
	readonly owner: Promise<BlogOwnerModel>;
	constructor(init: ModelInit<BlogModel>);
	static copyOf(
		source: BlogModel,
		mutator: (draft: MutableModel<BlogModel>) => MutableModel<BlogModel> | void,
	): BlogModel;
}

declare class PostModel {
	readonly id: string;
	readonly title: string;
	readonly blog: Promise<BlogModel | undefined>;
	readonly reference: Promise<PostModel | undefined>;
	readonly comments: AsyncCollection<CommentModel>;
	readonly authors: AsyncCollection<PostAuthorJoinModel>;
	readonly metadata?: PostMetadataType;
	constructor(init: ModelInit<PostModel>);
	static copyOf(
		source: PostModel,
		mutator: (draft: MutableModel<PostModel>) => MutableModel<PostModel> | void,
	): PostModel;
}

declare class ProjectModel {
	readonly id: string;
	readonly name?: string;
	readonly teamID?: string;
	readonly team: Promise<TeamModel | undefined>;
	constructor(init: ModelInit<ProjectModel>);
	static copyOf(
		source: ProjectModel,
		mutator: (
			draft: MutableModel<ProjectModel>,
		) => MutableModel<ProjectModel> | void,
	): ProjectModel;
}

declare class TeamModel {
	readonly id: string;
	readonly name: string;
	constructor(init: ModelInit<TeamModel>);
	static copyOf(
		source: TeamModel,
		mutator: (draft: MutableModel<TeamModel>) => MutableModel<TeamModel> | void,
	): TeamModel;
}

declare class PostMetadataType {
	readonly rating: number;
	readonly tags?: string[];
	readonly nested?: NestedType;
	constructor(init: PostMetadataType);
}

declare class NestedType {
	readonly aField: string;
	constructor(init: NestedType);
}

declare class CommentModel {
	readonly id: string;
	readonly content?: string;
	readonly post: Promise<PostModel | undefined>;
	constructor(init: ModelInit<CommentModel>);
	static copyOf(
		source: CommentModel,
		mutator: (
			draft: MutableModel<CommentModel>,
		) => MutableModel<CommentModel> | void,
	): CommentModel;
}

declare class PostAuthorJoinModel {
	readonly id: string;
	readonly author: Promise<AuthorModel | undefined>;
	readonly post: Promise<PostModel | undefined>;
	constructor(init: ModelInit<PostAuthorJoinModel>);
	static copyOf(
		source: PostAuthorJoinModel,
		mutator: (
			draft: MutableModel<PostAuthorJoinModel>,
		) => MutableModel<PostAuthorJoinModel> | void,
	): PostAuthorJoinModel;
}

declare class ForumModel {
	readonly id: string;
	readonly title: string;
	readonly editors: AsyncCollection<ForumEditorJoinModel>;
	constructor(init: ModelInit<ForumModel>);
	static copyOf(
		source: ForumModel,
		mutator: (
			draft: MutableModel<ForumModel>,
		) => MutableModel<ForumModel> | void,
	): ForumModel;
}

declare class ForumEditorJoinModel {
	readonly id: string;
	readonly editor: Promise<EditorModel | undefined>;
	readonly forum: Promise<ForumModel | undefined>;
	constructor(init: ModelInit<ForumEditorJoinModel>);
	static copyOf(
		source: ForumEditorJoinModel,
		mutator: (
			draft: MutableModel<ForumEditorJoinModel>,
		) => MutableModel<ForumEditorJoinModel> | void,
	): ForumEditorJoinModel;
}

declare class EditorModel {
	readonly id: string;
	readonly name: string;
	readonly forums: AsyncCollection<ForumEditorJoinModel>;
	constructor(init: ModelInit<EditorModel>);
	static copyOf(
		source: EditorModel,
		mutator: (
			draft: MutableModel<EditorModel>,
		) => MutableModel<EditorModel> | void,
	): EditorModel;
}

declare class AuthorModel {
	readonly id: string;

	/**
	 * For testing Boolean comparisions.
	 */
	readonly isActive?: boolean;

	/**
	 * For testing Float comparisions.
	 */
	readonly rating?: number;

	/**
	 * For testing Int comparisions.
	 */
	readonly karma?: number;

	/**
	 * For testing String comparisons.
	 */
	readonly name: string;

	readonly posts: AsyncCollection<PostAuthorJoinModel>;
	constructor(init: ModelInit<AuthorModel>);
	static copyOf(
		source: AuthorModel,
		mutator: (
			draft: MutableModel<AuthorModel>,
		) => MutableModel<AuthorModel> | void,
	): AuthorModel;
}

declare class BlogOwnerModel {
	readonly name: string;
	readonly id: string;
	readonly blog: Promise<BlogModel | undefined>;
	constructor(init: ModelInit<BlogOwnerModel>);
	static copyOf(
		source: BlogOwnerModel,
		mutator: (
			draft: MutableModel<BlogOwnerModel>,
		) => MutableModel<BlogOwnerModel> | void,
	): BlogOwnerModel;
}

declare class PersonModel {
	readonly id: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly username?: string;
	readonly age?: number;
	constructor(init: ModelInit<PersonModel>);
	static copyOf(
		source: PersonModel,
		mutator: (
			draft: MutableModel<PersonModel>,
		) => MutableModel<PersonModel> | void,
	): PersonModel;
}

declare class SongModel {
	readonly id: string;
	readonly songID: string;
	readonly name: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<SongModel>);
	static copyOf(
		source: SongModel,
		mutator: (draft: MutableModel<SongModel>) => MutableModel<SongModel> | void,
	): SongModel;
}

declare class AlbumModel {
	readonly id: string;
	readonly name: string;
	readonly songs: AsyncCollection<SongModel>;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<AlbumModel>);
	static copyOf(
		source: AlbumModel,
		mutator: (
			draft: MutableModel<AlbumModel>,
		) => MutableModel<AlbumModel> | void,
	): AlbumModel;
}

const {
	Author,
	Album,
	Song,
	Post,
	Forum,
	ForumEditorJoin,
	Editor,
	Comment,
	Blog,
	BlogOwner,
	PostAuthorJoin,
	Person,
	PostMetadata,
	Nested,
	Project,
	Team,
} = initSchema(newSchema) as {
	Author: PersistentModelConstructor<AuthorModel>;
	Album: PersistentModelConstructor<AlbumModel>;
	Song: PersistentModelConstructor<SongModel>;
	Post: PersistentModelConstructor<PostModel>;
	Forum: PersistentModelConstructor<ForumModel>;
	ForumEditorJoin: PersistentModelConstructor<ForumEditorJoinModel>;
	Editor: PersistentModelConstructor<EditorModel>;
	Comment: PersistentModelConstructor<CommentModel>;
	Blog: PersistentModelConstructor<BlogModel>;
	BlogOwner: PersistentModelConstructor<BlogOwnerModel>;
	PostAuthorJoin: PersistentModelConstructor<PostAuthorJoinModel>;
	Person: PersistentModelConstructor<PersonModel>;
	PostMetadata: NonModelTypeConstructor<PostMetadataType>;
	Nested: NonModelTypeConstructor<NestedType>;
	Project: PersistentModelConstructor<ProjectModel>;
	Team: PersistentModelConstructor<TeamModel>;
};

export {
	Author,
	Album,
	Song,
	Post,
	Forum,
	ForumEditorJoin,
	Editor,
	Comment,
	Blog,
	BlogOwner,
	PostAuthorJoin,
	Person,
	PostMetadata,
	Nested,
	Project,
	Team,
	newSchema as schema,
};
