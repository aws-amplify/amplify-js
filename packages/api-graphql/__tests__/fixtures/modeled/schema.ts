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
});

export type Schema = ClientSchema<typeof schema>;
