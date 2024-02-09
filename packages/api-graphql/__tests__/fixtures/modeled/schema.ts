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

	CommunityPost: a.model({
		id: a.id().required(),
		poll: a.hasOne('CommunityPoll'),
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

	// custom queries and mutations
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
		.function('echoFunction')
		.authorization([a.allow.public()]),

	// custom query returning a primitive type
	echoString: a
		.query()
		.arguments({
			inputString: a.string().required(),
		})
		.returns(a.string())
		.function('echoFunction')
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
		.function('echoFunction')
		.authorization([a.allow.private()]),

	// custom mutation returning a model type
	// NOTE: I'm not sure we can/should actually support this.
	// What are the implications of returning a model? What if it has
	// relationships? When/Where are those resolved? Does this work today?
	// TODO: Need to test this case directly.
	Post: a
		.model({
			id: a.id().required(),
			content: a.string(),
		})
		.authorization([a.allow.public('apiKey'), a.allow.owner()]),
	listPostReturnPost: a
		.mutation()
		.arguments({
			postId: a.id().required(),
		})
		.returns(a.ref('Post'))
		.function('echoFunction')
		.authorization([a.allow.private()]),
});

export type Schema = ClientSchema<typeof schema>;
