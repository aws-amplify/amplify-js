/**
 * Generated from `./schema.ts` by amplify-backend generate config.
 *
 * Cognito fields etc. omitted.
 */
const amplifyConfig = {
	aws_project_region: 'us-east-2',
	aws_appsync_graphqlEndpoint: 'https://localhost/graphql',
	aws_appsync_region: 'us-west-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'FAKE-KEY',
	modelIntrospection: {
		version: 1,
		models: {
			Todo: {
				name: 'Todo',
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
					description: {
						name: 'description',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					notes: {
						name: 'notes',
						isArray: true,
						type: {
							model: 'Note',
						},
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['todoNotesId'],
						},
					},
					meta: {
						name: 'meta',
						isArray: false,
						type: {
							model: 'TodoMetadata',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['todoMetaId'],
						},
					},
					status: {
						name: 'status',
						isArray: false,
						type: {
							enum: 'Status',
						},
						isRequired: false,
						attributes: [],
					},
					tags: {
						name: 'tags',
						isArray: true,
						type: 'String',
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
					todoMetaId: {
						name: 'todoMetaId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Todos',
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
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			Note: {
				name: 'Note',
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
					todo: {
						name: 'todo',
						isArray: false,
						type: {
							model: 'Todo',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'BELONGS_TO',
							targetNames: ['todoNotesId'],
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
					todoNotesId: {
						name: 'todoNotesId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Notes',
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
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			TodoMetadata: {
				name: 'TodoMetadata',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					data: {
						name: 'data',
						isArray: false,
						type: 'AWSJSON',
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
				pluralName: 'TodoMetadata',
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
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			ThingWithCustomerOwnerField: {
				name: 'ThingWithCustomerOwnerField',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					customField: {
						name: 'customField',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					description: {
						name: 'description',
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
				pluralName: 'ThingWithCustomerOwnerFields',
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
									provider: 'userPools',
									ownerField: 'customField',
									allow: 'owner',
									identityClaim: 'cognito:username',
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
			ThingWithOwnerFieldSpecifiedInModel: {
				name: 'ThingWithOwnerFieldSpecifiedInModel',
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
				pluralName: 'ThingWithOwnerFieldSpecifiedInModels',
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			ThingWithAPIKeyAuth: {
				name: 'ThingWithAPIKeyAuth',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
				pluralName: 'ThingWithAPIKeyAuths',
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
									provider: 'apiKey',
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
			ThingWithoutExplicitAuth: {
				name: 'ThingWithoutExplicitAuth',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
				pluralName: 'ThingWithoutExplicitAuths',
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			ThingWithCustomPk: {
				name: 'ThingWithCustomPk',
				fields: {
					cpk_cluster_key: {
						name: 'cpk_cluster_key',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					cpk_sort_key: {
						name: 'cpk_sort_key',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					otherField: {
						name: 'otherField',
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
				pluralName: 'ThingWithCustomPks',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['cpk_cluster_key', 'cpk_sort_key'],
						},
					},
				],
				primaryKeyInfo: {
					isCustomPrimaryKey: true,
					primaryKeyFieldName: 'cpk_cluster_key',
					sortKeyFieldNames: ['cpk_sort_key'],
				},
			},

			//

			CommunityPoll: {
				name: 'CommunityPoll',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					question: {
						name: 'question',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					answers: {
						name: 'answers',
						isArray: true,
						type: {
							model: 'CommunityPollAnswer',
						},
						isRequired: true,
						attributes: [],
						isArrayNullable: false,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['communityPollAnswersId'],
						},
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'CommunityPolls',
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
									provider: 'apiKey',
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
			CommunityPollAnswer: {
				name: 'CommunityPollAnswer',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					answer: {
						name: 'answer',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					votes: {
						name: 'votes',
						isArray: true,
						type: {
							model: 'CommunityPollVote',
						},
						isRequired: true,
						attributes: [],
						isArrayNullable: false,
						association: {
							connectionType: 'HAS_MANY',
							associatedWith: ['communityPollAnswerVotesId'],
						},
					},
					communityPollAnswersId: {
						name: 'communityPollAnswersId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'CommunityPollAnswers',
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
						type: 'key',
						properties: {
							name: 'gsi-CommunityPoll.answers',
							fields: ['communityPollAnswersId'],
						},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
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
			CommunityPollVote: {
				name: 'CommunityPollVote',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
						attributes: [],
					},
					communityPollAnswerVotesId: {
						name: 'communityPollAnswerVotesId',
						isArray: false,
						type: 'ID',
						isRequired: false,
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
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'CommunityPollVotes',
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
						type: 'key',
						properties: {
							name: 'gsi-CommunityPollAnswer.votes',
							fields: ['communityPollAnswerVotesId'],
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			CommunityPost: {
				name: 'CommunityPost',
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
					poll: {
						name: 'poll',
						isArray: false,
						type: {
							model: 'CommunityPoll',
						},
						isRequired: false,
						attributes: [],
						association: {
							connectionType: 'HAS_ONE',
							associatedWith: ['id'],
							targetNames: ['communityPostPollId'],
						},
					},

					metadata: {
						name: 'metadata',
						isArray: false,
						type: {
							nonModel: 'CommunityPostMetadata',
						},
						isRequired: false,
						attributes: [],
					},

					communityPostPollId: {
						name: 'communityPostPollId',
						isArray: false,
						type: 'ID',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'CommunityPosts',
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
									provider: 'apiKey',
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
			SecondaryIndexModel: {
				name: 'SecondaryIndexModel',
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
						isRequired: false,
						attributes: [],
					},
					description: {
						name: 'description',
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
					status: {
						name: 'status',
						isArray: false,
						type: {
							enum: 'Status',
						},
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'SecondaryIndexModels',
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
						type: 'key',
						properties: {
							name: 'secondaryIndexModelsByTitle',
							queryField: 'listByTitle',
							fields: ['title'],
						},
					},
					{
						type: 'key',
						properties: {
							name: 'secondaryIndexModelsByDescriptionAndViewCount',
							queryField: 'listByDescriptionAndViewCount',
							fields: ['description', 'viewCount'],
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
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
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
							associatedWith: ['postCommentsId'],
						},
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
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
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
							fields: ['id'],
						},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
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
							targetNames: ['postCommentsId'],
						},
					},
					postCommentsId: {
						name: 'postCommentsId',
						isArray: false,
						type: 'ID',
						isRequired: false,
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
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
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
							fields: ['id'],
						},
					},
					{
						type: 'auth',
						properties: {
							rules: [
								{
									allow: 'public',
									provider: 'apiKey',
									operations: ['create', 'update', 'delete', 'read'],
								},
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			Product: {
				name: 'Product',
				fields: {
					sku: {
						name: 'sku',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					factoryId: {
						name: 'factoryId',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					warehouseId: {
						name: 'warehouseId',
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
					trackingMeta: {
						name: 'trackingMeta',
						isArray: false,
						type: {
							nonModel: 'ProductTrackingMeta',
						},
						isRequired: false,
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
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'Products',
				attributes: [
					{
						type: 'model',
						properties: {},
					},
					{
						type: 'key',
						properties: {
							fields: ['sku', 'factoryId', 'warehouseId'],
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
								{
									allow: 'public',
									operations: ['read'],
								},
							],
						},
					},
				],
				primaryKeyInfo: {
					isCustomPrimaryKey: true,
					primaryKeyFieldName: 'sku',
					sortKeyFieldNames: ['factoryId', 'warehouseId'],
				},
			},
			ImplicitOwner: {
				name: 'ImplicitOwner',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'ImplicitOwners',
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
				primaryKeyInfo: {
					isCustomPrimaryKey: false,
					primaryKeyFieldName: 'id',
					sortKeyFieldNames: [],
				},
			},
			CustomImplicitOwner: {
				name: 'CustomImplicitOwner',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
					customOwner: {
						name: 'customOwner',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'CustomImplicitOwners',
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
									provider: 'userPools',
									ownerField: 'customOwner',
									allow: 'owner',
									identityClaim: 'cognito:username',
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
			ModelGroupDefinedIn: {
				name: 'ModelGroupDefinedIn',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
					groupField: {
						name: 'groupField',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'ModelGroupDefinedIns',
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
									groupClaim: 'cognito:groups',
									provider: 'userPools',
									allow: 'groups',
									groupsField: 'groupField',
									groupField: 'groups',
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
			ModelGroupsDefinedIn: {
				name: 'ModelGroupsDefinedIn',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
					groupsField: {
						name: 'groupsField',
						isArray: true,
						type: 'String',
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
					},
					createdAt: {
						name: 'createdAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					updatedAt: {
						name: 'updatedAt',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
				},
				syncable: true,
				pluralName: 'ModelGroupsDefinedIns',
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
									groupClaim: 'cognito:groups',
									provider: 'userPools',
									allow: 'groups',
									groupsField: 'groupsField',
									groupField: 'groups',
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
			ModelStaticGroup: {
				name: 'ModelStaticGroup',
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
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
				pluralName: 'ModelStaticGroups',
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
									groupClaim: 'cognito:groups',
									provider: 'userPools',
									allow: 'groups',
									groups: ['Admin'],
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
		},
		enums: {
			Status: {
				name: 'Status',
				values: ['NOT_STARTED', 'STARTED', 'DONE', 'CANCELED'],
			},
			ProductMetaStatus: {
				name: 'ProductMetaStatus',
				values: ['discontinued', 'in_production'],
			},
		},
		nonModels: {
			CommunityPostMetadata: {
				name: 'CommunityPostMetadata',
				fields: {
					type: {
						name: 'type',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},

					deleted: {
						name: 'deleted',
						isArray: false,
						type: 'Boolean',
						isRequired: false,
						attributes: [],
					},
				},
			},
			EchoResult: {
				name: 'EchoResult',
				fields: {
					resultContent: {
						name: 'resultContent',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
				},
			},
			PostLikeResult: {
				name: 'PostLikeResult',
				fields: {
					likes: {
						name: 'likes',
						isArray: false,
						type: 'Int',
						isRequired: true,
						attributes: [],
					},
				},
			},
			ProductMeta: {
				name: 'ProductMeta',
				fields: {
					releaseDate: {
						name: 'releaseDate',
						isArray: false,
						type: 'AWSDate',
						isRequired: false,
						attributes: [],
					},
					status: {
						name: 'status',
						isArray: false,
						type: {
							enum: 'ProductMetaStatus',
						},
						isRequired: false,
						attributes: [],
					},
					deepMeta: {
						name: 'deepMeta',
						isArray: false,
						type: {
							nonModel: 'ProductMetaDeepMeta',
						},
						isRequired: false,
						attributes: [],
					},
				},
			},
			ProductTrackingMeta: {
				name: 'ProductTrackingMeta',
				fields: {
					productMeta: {
						name: 'productMeta',
						isArray: false,
						type: {
							nonModel: 'ProductMeta',
						},
						isRequired: false,
						attributes: [],
					},
					note: {
						name: 'note',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
			},
			ProductMetaDeepMeta: {
				name: 'ProductMetaDeepMeta',
				fields: {
					content: {
						name: 'content',
						isArray: false,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
				},
			},
		},
		queries: {
			echo: {
				name: 'echo',
				isArray: false,
				type: {
					nonModel: 'EchoResult',
				},
				isRequired: false,
				arguments: {
					argumentContent: {
						name: 'argumentContent',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
			echoString: {
				name: 'echoString',
				isArray: false,
				type: 'String',
				isRequired: false,
				arguments: {
					inputString: {
						name: 'inputString',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
			echoNestedCustomTypes: {
				name: 'echoNestedCustomTypes',
				isArray: false,
				type: {
					nonModel: 'ProductTrackingMeta',
				},
				isRequired: false,
				arguments: {
					argumentContent: {
						name: 'input',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
			echoModelHasNestedTypes: {
				name: 'echoModelHasNestedTypes',
				isArray: false,
				type: {
					model: 'Product',
				},
				isRequired: false,
				arguments: {
					argumentContent: {
						name: 'input',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
		},
		mutations: {
			likePost: {
				name: 'likePost',
				isArray: false,
				type: {
					nonModel: 'PostLikeResult',
				},
				isRequired: false,
				arguments: {
					postId: {
						name: 'postId',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
				},
			},
			likePostReturnPost: {
				name: 'likePostReturnPost',
				isArray: false,
				type: {
					model: 'Post',
				},
				isRequired: false,
				arguments: {
					postId: {
						name: 'postId',
						isArray: true,
						type: 'ID',
						isRequired: true,
						isArrayNullable: false,
					},
				},
			},
		},
		subscriptions: {
			onPostLiked: {
				name: 'onPostLiked',
				isArray: false,
				type: {
					model: 'Post',
				},
				isRequired: false,
			},
			onPostUpdated: {
				name: 'onPostUpdated',
				isArray: false,
				type: {
					model: 'Post',
				},
				isRequired: false,
				arguments: {
					postId: {
						name: 'postId',
						isArray: false,
						type: 'String',
						isRequired: false,
					},
				},
			},
		},
	},
};
export default amplifyConfig;
