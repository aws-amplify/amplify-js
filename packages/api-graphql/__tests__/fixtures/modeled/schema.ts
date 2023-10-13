import { type ClientSchema, a } from '@aws-amplify/amplify-api-next-alpha';

const schema = a.schema({
	Todo: a.model({
		name: a.string(),
		description: a.string(),
		notes: a.hasMany('Note'),
		meta: a.hasOne('TodoMetadata'),
	}),
	Note: a.model({
		body: a.string().required(),
		todo: a.belongsTo('Todo'),
	}),
	TodoMetadata: a.model({
		data: a.json(),
	}),
});

export type Schema = ClientSchema<typeof schema>;

type Todo = Schema['Todo'];
type MaybeTodo = Exclude<
	Awaited<ReturnType<Schema['Note']['todo']>>,
	null | undefined
>;

type TEST = Todo extends MaybeTodo ? 'yes' : 'no';

type Note_dot_todo = Schema['Note']['todo'];
