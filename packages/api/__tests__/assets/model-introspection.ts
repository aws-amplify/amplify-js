export default {
	version: 1,
	models: {
		Post: {
			name: 'Post',
			fields: {
				postId: {
					name: 'postId',
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
				summary: {
					name: 'summary',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				viewCount: {
					name: 'viewCount',
					isArray: false,
					type: 'Int',
					isRequired: false,
					attributes: [],
				},
				comments: {
					name: 'comments',
					isArray: true,
					type: {
						model: 'Comment',
					},
					isRequired: false,
					attributes: [],
					isArrayNullable: true,
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: ['postCommentsPostId', 'postCommentsTitle'],
					},
				},
				comments2: {
					name: 'comments2',
					isArray: true,
					type: {
						model: 'Comment',
					},
					isRequired: false,
					attributes: [],
					isArrayNullable: true,
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: ['postComments2PostId', 'postComments2Title'],
					},
				},
				author: {
					name: 'author',
					isArray: false,
					type: {
						model: 'User',
					},
					isRequired: false,
					attributes: [],
					association: {
						connectionType: 'HAS_ONE',
						associatedWith: ['id'],
						targetNames: ['postAuthorId'],
					},
				},
				tags: {
					name: 'tags',
					isArray: true,
					type: {
						model: 'PostTags',
					},
					isRequired: false,
					attributes: [],
					isArrayNullable: true,
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: ['post'],
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
				postAuthorId: {
					name: 'postAuthorId',
					isArray: false,
					type: 'ID',
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
						fields: ['postId', 'title'],
					},
				},
				{
					type: 'auth',
					properties: {
						rules: [
							{
								allow: 'public',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
					},
				},
			],
			primaryKeyInfo: {
				isCustomPrimaryKey: true,
				primaryKeyFieldName: 'postId',
				sortKeyFieldNames: ['title'],
			},
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
				bingo: {
					name: 'bingo',
					isArray: false,
					type: 'String',
					isRequired: true,
					attributes: [],
				},
				anotherField: {
					name: 'anotherField',
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
						targetNames: ['postCommentsPostId', 'postCommentsTitle'],
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
				postCommentsPostId: {
					name: 'postCommentsPostId',
					isArray: false,
					type: 'ID',
					isRequired: false,
					attributes: [],
				},
				postCommentsTitle: {
					name: 'postCommentsTitle',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				postComments2PostId: {
					name: 'postComments2PostId',
					isArray: false,
					type: 'ID',
					isRequired: false,
					attributes: [],
				},
				postComments2Title: {
					name: 'postComments2Title',
					isArray: false,
					type: 'String',
					isRequired: false,
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
						fields: ['id'],
					},
				},
				{
					type: 'auth',
					properties: {
						rules: [
							{
								allow: 'public',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
					},
				},
			],
			primaryKeyInfo: {
				isCustomPrimaryKey: false,
				primaryKeyFieldName: 'id',
				sortKeyFieldNames: [],
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
						targetNames: ['userPostPostId', 'userPostTitle'],
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
				userPostPostId: {
					name: 'userPostPostId',
					isArray: false,
					type: 'ID',
					isRequired: false,
					attributes: [],
				},
				userPostTitle: {
					name: 'userPostTitle',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
			},
			syncable: true,
			pluralName: 'Users',
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
				{
					type: 'auth',
					properties: {
						rules: [
							{
								allow: 'public',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
					},
				},
			],
			primaryKeyInfo: {
				isCustomPrimaryKey: false,
				primaryKeyFieldName: 'id',
				sortKeyFieldNames: [],
			},
		},
		Tag: {
			name: 'Tag',
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
						model: 'PostTags',
					},
					isRequired: false,
					attributes: [],
					isArrayNullable: true,
					association: {
						connectionType: 'HAS_MANY',
						associatedWith: ['tag'],
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
			pluralName: 'Tags',
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
								allow: 'public',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
					},
				},
			],
			primaryKeyInfo: {
				isCustomPrimaryKey: false,
				primaryKeyFieldName: 'id',
				sortKeyFieldNames: [],
			},
		},
		PostTags: {
			name: 'PostTags',
			fields: {
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
				postPostId: {
					name: 'postPostId',
					isArray: false,
					type: 'ID',
					isRequired: false,
					attributes: [],
				},
				posttitle: {
					name: 'posttitle',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				tagId: {
					name: 'tagId',
					isArray: false,
					type: 'ID',
					isRequired: false,
					attributes: [],
				},
				post: {
					name: 'post',
					isArray: false,
					type: {
						model: 'Post',
					},
					isRequired: true,
					attributes: [],
					association: {
						connectionType: 'BELONGS_TO',
						targetNames: ['postPostId', 'posttitle'],
					},
				},
				tag: {
					name: 'tag',
					isArray: false,
					type: {
						model: 'Tag',
					},
					isRequired: true,
					attributes: [],
					association: {
						connectionType: 'BELONGS_TO',
						targetNames: ['tagId'],
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
			pluralName: 'PostTags',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
				{
					type: 'key',
					properties: {
						name: 'byPost',
						fields: ['postPostId', 'posttitle'],
					},
				},
				{
					type: 'key',
					properties: {
						name: 'byTag',
						fields: ['tagId'],
					},
				},
			],
			primaryKeyInfo: {
				isCustomPrimaryKey: false,
				primaryKeyFieldName: 'id',
				sortKeyFieldNames: [],
			},
		},
	},
	enums: {},
	nonModels: {},
};
