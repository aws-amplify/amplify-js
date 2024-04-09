import { type ClientSchema, a } from '@aws-amplify/data-schema';

const schema = a.schema({
	Todo: a
		.model({
			name: a.string(),
			description: a.string(),
			notes: a.hasMany('Note'),
			meta: a.hasOne('TodoMetadata'),
			status: a.enum(['NOT_STARTED', 'STARTED', 'DONE', 'CANCELED']),
			tags: a.string().array(),
		})
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	Note: a
		.model({
			body: a.string().required(),
			todo: a.belongsTo('Todo'),
		})
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	TodoMetadata: a
		.model({
			data: a.json(),
		})
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	ThingWithCustomerOwnerField: a
		.model({
			id: a.id(),
			description: a.string(),
		})
		.authorization([a.allow.owner('userPools').inField('customField')]),
	ThingWithOwnerFieldSpecifiedInModel: a
		.model({
			id: a.id(),
			name: a.string(),
			owner: a.string(),
		})
		.authorization([a.allow.owner()]),
	ThingWithAPIKeyAuth: a
		.model({
			id: a.id(),
			description: a.string(),
		})
		.authorization([a.allow.public('apiKey')]),
	ThingWithoutExplicitAuth: a.model({
		id: a.id(),
		description: a.string(),
	}),
	ThingWithCustomPk: a
		.model({
			cpk_cluster_key: a.string().required(),
			cpk_sort_key: a.string().required(),
			otherField: a.string(),
		})
		.identifier(['cpk_cluster_key', 'cpk_sort_key']),

	CommunityPostMetadata: a.customType({
		type: a.string().required(),
		deleted: a.boolean(),
	}),

	CommunityPost: a.model({
		id: a.id().required(),
		poll: a.hasOne('CommunityPoll'),
		metadata: a.ref('CommunityPostMetadata'),
	}),
	CommunityPoll: a.model({
		id: a.id().required(),
		question: a.string().required(),
		answers: a.hasMany('CommunityPollAnswer').arrayRequired().valueRequired(),
	}),
	CommunityPollAnswer: a.model({
		id: a.id().required(),
		answer: a.string().required(),
		votes: a.hasMany('CommunityPollVote').arrayRequired().valueRequired(),
	}),
	CommunityPollVote: a
		.model({ id: a.id().required() })
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	SecondaryIndexModel: a
		.model({
			title: a.string(),
			description: a.string(),
			viewCount: a.integer(),
			status: a.enum(['draft', 'pending', 'published']),
		})
		.secondaryIndexes(index => [
			index('title'),
			index('description').sortKeys(['viewCount']),
		]),
	Product: a
		.model({
			sku: a.string().required(),
			factoryId: a.string().required(),
			warehouseId: a.string().required(),
			description: a.string(),
			trackingMeta: a.customType({
				productMeta: a.ref('ProductMeta'),
				note: a.string(),
			}),
		})
		.identifier(['sku', 'factoryId', 'warehouseId'])
		.authorization([a.allow.public()]),
	ProductMeta: a.customType({
		releaseDate: a.date(),
		status: a.enum(['in_production', 'discontinued']),
		deepMeta: a.customType({
			content: a.string(),
		}),
	}),

	// #region Custom queries and mutations
	EchoResult: a.customType({
		resultContent: a.string().required(),
	}),

	// custom query returning a non-model type
	echo: a
		.query()
		.arguments({
			argumentContent: a.string().required(),
		})
		.returns(a.ref('EchoResult'))
		.handler(a.handler.function('echoFunction'))
		.authorization([a.allow.public()]),

	// custom query returning a primitive type
	echoString: a
		.query()
		.arguments({
			inputString: a.string().required(),
		})
		.returns(a.string())
		.handler(a.handler.function('echoFunction'))
		.authorization([a.allow.public()]),
	echoNestedCustomTypes: a
		.query()
		.arguments({
			input: a.string().required(),
		})
		.returns(a.ref('ProductTrackingMeta'))
		.handler(a.handler.function('echoFunction'))
		.authorization([a.allow.public()]),
	echoModelHasNestedTypes: a
		.query()
		.arguments({
			input: a.string().required(),
		})
		.returns(a.ref('Product'))
		.handler(a.handler.function('echoFunction'))
		.authorization([a.allow.public()]),
	// custom mutation returning a non-model type
	PostLikeResult: a.customType({
		likes: a.integer().required(),
	}),
	likePost: a
		.mutation()
		.arguments({
			postId: a.id().required(),
		})
		.returns(a.ref('PostLikeResult'))
		.handler(a.handler.function('echoFunction'))
		.authorization([a.allow.private()]),

	// custom mutation returning a model type
	Post: a
		.model({
			id: a.id().required(),
			content: a.string(),
			comments: a.hasMany('Comment'),
		})
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	Comment: a
		.model({
			id: a.id().required(),
			content: a.string().required(),
			post: a.belongsTo('Post'),
		})
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	likePostReturnPost: a
		.mutation()
		.arguments({
			postId: a.id().required(),
		})
		.returns(a.ref('Post'))
		.handler(a.handler.function('echoFunction'))
		.authorization([a.allow.private()]),

	onPostLiked: a
		.subscription()
		.for(a.ref('likePostReturnPost'))
		.handler(a.handler.custom({ entry: './jsResolver_base.js' })),

	onPostUpdated: a
		.subscription()
		.for(a.ref('Post').mutations(['update']))
		.arguments({ postId: a.string() })
		.handler(a.handler.custom({ entry: './jsResolver_base.js' })),
	//#endregion

	// #region implicit ownership models
	ImplicitOwner: a
		.model({
			description: a.string(),
		})
		.authorization([a.allow.owner()]),
	CustomImplicitOwner: a
		.model({
			description: a.string(),
		})
		.authorization([a.allow.owner().inField('customOwner')]),
	ModelGroupDefinedIn: a
		.model({
			description: a.string(),
		})
		.authorization([a.allow.groupDefinedIn('groupField')]),
	ModelGroupsDefinedIn: a
		.model({
			description: a.string(),
		})
		.authorization([a.allow.groupsDefinedIn('groupsField')]),
	ModelStaticGroup: a
		.model({
			description: a.string(),
		})
		.authorization([a.allow.specificGroup('Admin')]),
	// #endregion
});

export type Schema = ClientSchema<typeof schema>;
