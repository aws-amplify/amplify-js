import {
	initSchema,
	NonModelTypeConstructor,
	ModelInit,
	MutableModel,
	PersistentModelConstructor,
	Schema,
} from '../src/index';
import { newSchema } from './schema';

declare class BlogModel {
	readonly id: string;
	readonly name: string;
	readonly posts?: PostModel[];
	readonly owner: BlogOwnerModel;
	constructor(init: ModelInit<BlogModel>);
	static copyOf(
		source: BlogModel,
		mutator: (draft: MutableModel<BlogModel>) => MutableModel<BlogModel> | void
	): BlogModel;
}

declare class PostModel {
	readonly id: string;
	readonly title: string;
	readonly blog?: BlogModel;
	readonly reference?: PostModel;
	readonly comments?: CommentModel[];
	readonly authors?: PostAuthorJoinModel[];
	readonly metadata?: PostMetadataType;
	constructor(init: ModelInit<PostModel>);
	static copyOf(
		source: PostModel,
		mutator: (draft: MutableModel<PostModel>) => MutableModel<PostModel> | void
	): PostModel;
}

declare class ProjectModel {
	readonly id: string;
	readonly name?: string;
	readonly teamID?: string;
	readonly team?: Promise<TeamModel>;
	constructor(init: ModelInit<ProjectModel>);
	static copyOf(
		source: ProjectModel,
		mutator: (
			draft: MutableModel<ProjectModel>
		) => MutableModel<ProjectModel> | void
	): ProjectModel;
}

declare class TeamModel {
	readonly id: string;
	readonly name: string;
	constructor(init: ModelInit<TeamModel>);
	static copyOf(
		source: TeamModel,
		mutator: (draft: MutableModel<TeamModel>) => MutableModel<TeamModel> | void
	): TeamModel;
}

declare class PostMetadataType {
	readonly rating: number;
	readonly tags?: string[];
	readonly nested?: NestedType;
	constructor(init: ModelInit<PostMetadataType>);
}

declare class NestedType {
	readonly aField: string;
	constructor(init: ModelInit<NestedType>);
}

declare class CommentModel {
	readonly id: string;
	readonly content?: string;
	readonly post?: PostModel;
	constructor(init: ModelInit<CommentModel>);
	static copyOf(
		source: CommentModel,
		mutator: (
			draft: MutableModel<CommentModel>
		) => MutableModel<CommentModel> | void
	): CommentModel;
}

declare class PostAuthorJoinModel {
	readonly id: string;
	readonly author?: AuthorModel;
	readonly post?: PostModel;
	constructor(init: ModelInit<PostAuthorJoinModel>);
	static copyOf(
		source: PostAuthorJoinModel,
		mutator: (
			draft: MutableModel<PostAuthorJoinModel>
		) => MutableModel<PostAuthorJoinModel> | void
	): PostAuthorJoinModel;
}

declare class AuthorModel {
	readonly id: string;
	readonly name: string;
	readonly posts?: PostAuthorJoinModel[];
	constructor(init: ModelInit<AuthorModel>);
	static copyOf(
		source: AuthorModel,
		mutator: (
			draft: MutableModel<AuthorModel>
		) => MutableModel<AuthorModel> | void
	): AuthorModel;
}

declare class BlogOwnerModel {
	readonly name: string;
	readonly id: string;
	readonly blog?: BlogModel;
	constructor(init: ModelInit<BlogOwnerModel>);
	static copyOf(
		source: BlogOwnerModel,
		mutator: (
			draft: MutableModel<BlogOwnerModel>
		) => MutableModel<BlogOwnerModel> | void
	): BlogOwnerModel;
}

declare class PersonModel {
	readonly id: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly username?: string;
}

const {
	Author,
	Post,
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
	Post: PersistentModelConstructor<PostModel>;
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
``;

export {
	Author,
	Post,
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
