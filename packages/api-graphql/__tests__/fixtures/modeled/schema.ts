import { type ClientSchema, a } from '@aws-amplify/data-schema';

const schema = a.schema({
	Todo: a
		.model({
			name: a.string(),
			description: a.string(),
			notes: a.hasMany('Note'),
			meta: a.hasOne('TodoMetadata'),
			status: a.enum(["NOT_STARTED", "STARTED", "DONE", "CANCELED"]),
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
});

export type Schema = ClientSchema<typeof schema>;
