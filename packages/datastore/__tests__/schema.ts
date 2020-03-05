import { Schema } from '../src/types';

export const newSchema: Schema = {
	models: {
		Blog: {
			syncable: true,
			name: 'Blog',
			pluralName: 'Blogs',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
			],
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
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: 'blog',
					},
				},
				owner: {
					name: 'owner',
					isArray: false,
					type: {
						model: 'BlogOwner',
					},
					isRequired: true,
					attributes: [],
					association: {
						connectionType: 'BELONGS_TO',
						targetName: 'blogOwnerId',
					},
				},
			},
		},
		Post: {
			syncable: true,
			name: 'Post',
			pluralName: 'Posts',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
			],
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
				reference: {
					name: 'reference',
					isArray: false,
					type: {
						model: 'Post',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'BELONGS_TO',
						targetName: 'referencePostId',
					},
				},
				blog: {
					name: 'blog',
					isArray: false,
					type: {
						model: 'Blog',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'BELONGS_TO',
						targetName: 'postBlogId',
					},
				},
				comments: {
					name: 'comments',
					isArray: true,
					type: {
						model: 'Comment',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: 'post',
					},
				},
				authors: {
					name: 'authors',
					isArray: true,
					type: {
						model: 'PostAuthorJoin',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: 'post',
					},
				},
			},
		},
		Comment: {
			syncable: true,
			name: 'Comment',
			pluralName: 'Comments',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
			],
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
						targetName: 'commentPostId',
					},
				},
			},
		},
		PostAuthorJoin: {
			syncable: true,
			name: 'PostAuthorJoin',
			pluralName: 'PostAuthorJoins',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
				{
					type: 'key',
					properties: {
						name: 'byAuthor',
						fields: ['authorId'],
					},
				},
				{
					type: 'key',
					properties: {
						name: 'byPost',
						fields: ['postId'],
					},
				},
			],
			fields: {
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
				author: {
					name: 'author',
					isArray: false,
					type: {
						model: 'Author',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'BELONGS_TO',
						targetName: 'authorId',
					},
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
						targetName: 'postId',
					},
				},
			},
		},
		Author: {
			syncable: true,
			name: 'Author',
			pluralName: 'Authors',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
			],
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
					isRequired: true,
					attributes: [],
				},
				posts: {
					name: 'posts',
					isArray: true,
					type: {
						model: 'PostAuthorJoin',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: 'author',
					},
				},
			},
		},
		BlogOwner: {
			syncable: true,
			name: 'BlogOwner',
			pluralName: 'BlogOwners',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
			],
			fields: {
				name: {
					name: 'name',
					isArray: false,
					type: 'String',
					isRequired: true,
					attributes: [],
				},
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
				blog: {
					name: 'blog',
					isArray: false,
					type: {
						model: 'Blog',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'HAS_ONE',
						associatedWith: 'owner',
					},
				},
			},
		},
	},
	enums: {},
	version: 'a66372d29356c40e7cd29e41527cead7',
};
