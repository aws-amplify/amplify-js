import { type ClientSchema, a } from '@aws-amplify/data-schema';

const schema = a.schema({
	Todo: a
		.model({
			name: a.string(),
			description: a.string(),
			notes: a.hasMany('Note', 'todoNotesId'),
			todoMetaId: a.id(),
			meta: a.hasOne('TodoMetadata', 'todoMetaId'),
			status: a.enum(['NOT_STARTED', 'STARTED', 'DONE', 'CANCELED']),
			tags: a.string().array(),
		})
		.authorization(allow => [allow.publicApiKey(), allow.owner()]),
	Note: a
		.model({
			body: a.string().required(),
			todoNotesId: a.id(),
			todo: a.belongsTo('Todo', 'todoNotesId'),
		})
		.authorization(allow => [allow.publicApiKey(), allow.owner()]),
	TodoMetadata: a
		.model({
			data: a.json(),
		})
		.authorization(allow => [allow.publicApiKey(), allow.owner()]),
	ThingWithCustomerOwnerField: a
		.model({
			id: a.id(),
			description: a.string(),
		})
		.authorization(allow => [allow.ownerDefinedIn('customField', 'userPools')]),
	ThingWithOwnerFieldSpecifiedInModel: a
		.model({
			id: a.id(),
			name: a.string(),
			owner: a.string(),
		})
		.authorization(allow => [allow.owner()]),
	ThingWithAPIKeyAuth: a
		.model({
			id: a.id(),
			description: a.string(),
		})
		.authorization(allow => [allow.publicApiKey()]),
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
		communityPostPollId: a.id(),
		poll: a.hasOne('CommunityPoll', 'communityPostPollId'),
		metadata: a.ref('CommunityPostMetadata'),
	}),
	CommunityPoll: a.model({
		id: a.id().required(),
		question: a.string().required(),
		answers: a.hasMany('CommunityPollAnswer', 'communityPollAnswersId').valueRequired()
	}),
	CommunityPollAnswer: a.model({
		id: a.id().required(),
		answer: a.string().required(),
		communityPollAnswersId: a.id(),
		votes: a.hasMany('CommunityPollVote', 'communityPollAnswerVotesId').valueRequired(),
	}),
	CommunityPollVote: a
		.model({
			id: a.id().required(),
			communityPollAnswerVotesId: a.id()
		})
		.authorization(allow => [allow.publicApiKey(), allow.owner()]),
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
			description: a.string(),
			warehouseProductsId: a.id(),
			warehouse: a.belongsTo("Warehouse", 'warehouseProductsId'),
			trackingMeta: a.customType({
				productMeta: a.ref('ProductMeta'),
				note: a.string(),
			}),
		})
		.identifier(['sku', 'factoryId'])
		.authorization(allow => [allow.owner(), allow.publicApiKey().to(["read"])]),
	Warehouse: a.model({
			name: a.string().required(),
			products: a.hasMany("Product", 'warehouseProductsId'),
		}).authorization(allow => [allow.owner(), allow.publicApiKey().to(["read"])]),
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
		.authorization(allow => [allow.publicApiKey()]),

	// custom query returning a primitive type
	echoString: a
		.query()
		.arguments({
			inputString: a.string().required(),
		})
		.returns(a.string())
		.handler(a.handler.function('echoFunction'))
		.authorization(allow => [allow.publicApiKey()]),
	echoNestedCustomTypes: a
		.query()
		.arguments({
			input: a.string().required(),
		})
		.returns(a.ref('ProductTrackingMeta'))
		.handler(a.handler.function('echoFunction'))
		.authorization(allow => [allow.publicApiKey()]),
	echoModelHasNestedTypes: a
		.query()
		.arguments({
			input: a.string().required(),
		})
		.returns(a.ref('Product'))
		.handler(a.handler.function('echoFunction'))
		.authorization(allow => [allow.publicApiKey()]),
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
		.authorization(allow => [allow.guest()]),

	// custom mutation returning a model type
	Post: a
		.model({
			id: a.id().required(),
			content: a.string(),
			comments: a.hasMany('Comment', 'postCommentsId'),
		})
		.authorization(allow => [allow.publicApiKey(), allow.owner()]),
	Comment: a
		.model({
			id: a.id().required(),
			content: a.string().required(),
			postCommentsId: a.id().required(),
			post: a.belongsTo('Post', 'postCommentsId'),
		})
		.authorization(allow => [allow.publicApiKey(), allow.owner()]),
	likePostReturnPost: a
		.mutation()
		.arguments({
			postId: a.id().required(),
		})
		.returns(a.ref('Post'))
		.handler(a.handler.function('echoFunction'))
		.authorization(allow => [allow.guest()]),

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
		.authorization(allow => [allow.owner()]),
	CustomImplicitOwner: a
		.model({
			description: a.string(),
		})
		.authorization(allow => [allow.ownerDefinedIn('customOwner')]),
	ModelGroupDefinedIn: a
		.model({
			description: a.string(),
		})
		.authorization(allow => [allow.groupDefinedIn('groupField')]),
	ModelGroupsDefinedIn: a
		.model({
			description: a.string(),
		})
		.authorization(allow => [allow.groupsDefinedIn('groupsField')]),
	ModelStaticGroup: a
		.model({
			description: a.string(),
		})
		.authorization(allow => [allow.group('Admin')]),
	// #endregion
});

export type Schema = ClientSchema<typeof schema>;
