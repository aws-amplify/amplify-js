import { type ClientSchema, a } from '@aws-amplify/amplify-api-next-alpha';

const schema = a.schema({
	Todo: a.model({
		name: a.string(),
		description: a.string(),
	}),
});

export type Schema = ClientSchema<typeof schema>;
